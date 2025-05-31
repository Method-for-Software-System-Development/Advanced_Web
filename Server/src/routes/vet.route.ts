/**
 * Veterinarian routes for managing veterinarian data.
 */

import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Vet from "../models/vetSchema";

const vetRouter = Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads/vets');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * GET /api/vets
 * Get all veterinarians
 * Query params: includeInactive=true to include inactive vets
 */
vetRouter.get("/", async (req: Request, res: Response) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const filter = includeInactive ? {} : { isActive: true };
    
    const vets = await Vet.find(filter).sort({ firstName: 1, lastName: 1 });
    res.send(vets);
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

/**
 * GET /api/vets/:id
 * Get a single veterinarian by ID
 */
vetRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const vet = await Vet.findById(req.params.id);
    if (!vet) {
      return res.status(404).send({ error: "Veterinarian not found" });
    }
    res.send(vet);
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

/**
 * POST /api/vets
 * Create a new veterinarian with optional image upload
 */
vetRouter.post("/", upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, specialization, licenseNumber, yearsOfExperience, description, availableSlots } = req.body;
    
    // Check if email or license number already exists
    const existingVet = await Vet.findOne({ 
      $or: [{ email }, { licenseNumber }] 
    });
    
    if (existingVet) {
      // If image was uploaded but vet creation fails, delete the uploaded file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).send({ 
        error: "Veterinarian with this email or license number already exists" 
      });
    }

    // Prepare vet data
    const vetData: any = { 
      firstName, 
      lastName, 
      email, 
      phone, 
      specialization, 
      licenseNumber, 
      yearsOfExperience, 
      description: description || '',
      availableSlots: Array.isArray(availableSlots) ? availableSlots : (availableSlots ? [availableSlots] : [])
    };

    // Add image URL if file was uploaded
    if (req.file) {
      vetData.imageUrl = `/uploads/vets/${req.file.filename}`;
    }

    const vet = new Vet(vetData);
    await vet.save();
    res.status(201).send(vet);
  } catch (error) {
    // If image was uploaded but vet creation fails, delete the uploaded file
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

/**
 * PUT /api/vets/:id
 * Update a veterinarian's information with optional image upload
 */
vetRouter.put("/:id", upload.single('image'), async (req: Request, res: Response) => {
  try {
    const vetId = req.params.id;
    const updateData = { ...req.body };

    // If updating email or license number, check for uniqueness
    if (updateData.email || updateData.licenseNumber) {
      const existingVet = await Vet.findOne({
        _id: { $ne: vetId },
        $or: [
          ...(updateData.email ? [{ email: updateData.email }] : []),
          ...(updateData.licenseNumber ? [{ licenseNumber: updateData.licenseNumber }] : [])
        ]
      });

      if (existingVet) {
        // If image was uploaded but update fails, delete the uploaded file
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).send({ 
          error: "Another veterinarian with this email or license number already exists" 
        });
      }
    }

    // Handle image upload
    if (req.file) {
      // Get the current vet to check for existing image
      const currentVet = await Vet.findById(vetId);
      if (currentVet?.imageUrl) {
        // Delete old image file
        const oldImagePath = path.join(__dirname, '../../', currentVet.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      // Set new image URL
      updateData.imageUrl = `/uploads/vets/${req.file.filename}`;
    }

    // Handle availableSlots array conversion
    if (updateData.availableSlots && !Array.isArray(updateData.availableSlots)) {
      updateData.availableSlots = [updateData.availableSlots];
    }

    const updatedVet = await Vet.findByIdAndUpdate(vetId, updateData, { 
      new: true, 
      runValidators: true 
    });
    
    if (!updatedVet) {
      // If image was uploaded but vet not found, delete the uploaded file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).send({ error: "Veterinarian not found" });
    }
    
    res.send(updatedVet);
  } catch (error) {
    // If image was uploaded but update fails, delete the uploaded file
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

/**
 * DELETE /api/vets/:id
 * Soft delete a veterinarian (set isActive to false)
 */
vetRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const updatedVet = await Vet.findByIdAndUpdate(
      req.params.id, 
      { isActive: false }, 
      { new: true }
    );
    
    if (!updatedVet) {
      return res.status(404).send({ error: "Veterinarian not found" });
    }
    
    res.send({ message: "Veterinarian deactivated successfully", vet: updatedVet });
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

/**
 * PATCH /api/vets/:id/activate
 * Reactivate a veterinarian
 */
vetRouter.patch("/:id/activate", async (req: Request, res: Response) => {
  try {
    const updatedVet = await Vet.findByIdAndUpdate(
      req.params.id, 
      { isActive: true }, 
      { new: true }
    );
    
    if (!updatedVet) {
      return res.status(404).send({ error: "Veterinarian not found" });
    }
    
    res.send({ message: "Veterinarian activated successfully", vet: updatedVet });
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

export default vetRouter;
