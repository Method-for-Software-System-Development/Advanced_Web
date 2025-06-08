/**
 * Pet Schema model for MongoDB using Mongoose.
 * Defines the structure for pet documents.
 */

import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Pet from "../models/petSchema";
import User from "../models/userSchema"; 
import mongoose from "mongoose";

const petRouter = Router();

// Create UserUploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../UserUploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for pet image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: pet-timestamp-originalname
    const uniqueName = `pet-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
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
 * GET /api/pets/:id
 * Get a single pet by pet ID
 */
petRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).send({ error: "Pet not found" });
    }
    res.send(pet);
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

/**
 * GET /api/pets/user/:userId
 * Get all pets owned by a specific user
 */
petRouter.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const pets = await Pet.find({ owner: req.params.userId });
    res.send(pets);
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

/**
 * POST /api/pets/byIds
 * Get pets by an array of IDs
 */
petRouter.post("/byIds", async (req: Request, res: Response) => {
  try {
    let ids = req.body.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).send({ error: "No IDs provided" });
    }
    // Convert all IDs to ObjectId for the query
    ids = ids.map((id: string) => new mongoose.Types.ObjectId(id));
    const pets = await Pet.find({ _id: { $in: ids } });
    res.send(pets);
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

/**
 * POST /api/pets
 * Add a new pet
 */
petRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { name, type, breed, birthYear, weight, sex, isActive, prescriptions, treatments, owner } = req.body;
      // Generate image URL based on pet type and sex
    const knownTypes = ['cat', 'dog', 'goat', 'parrot', 'rabbit', 'snake'];
    const lowerType = type?.toLowerCase() || '';
    const lowerSex = sex?.toLowerCase() || '';
    
    let imageUrl = '';
    
    // Check if it's a known animal type
    if (knownTypes.includes(lowerType)) {
      // For known types, use type_m or type_f based on sex
      const suffix = lowerSex === 'female' ? 'f' : 'm';
      imageUrl = `/assets/animals/${lowerType}_${suffix}.png`;
    } else {
      // For unknown types, use alien_m or alien_f based on sex
      const suffix = lowerSex === 'female' ? 'f' : 'm';
      imageUrl = `/assets/animals/alien_${suffix}.png`;
    }
    
    const pet = new Pet({ name, type, breed, birthYear, weight, sex, isActive, prescriptions, treatments, owner, imageUrl });
    await pet.save();

    // Add the pet's _id to the user's pets array
    if (owner) {
      await User.findByIdAndUpdate(owner, { $push: { pets: pet._id } });
    }

    res.status(201).send(pet);
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

/**
 * PUT /api/pets/:id
 * Update a pet's information
 */
petRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const updated = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).send({ error: "Pet not found" });
    }
    res.send(updated);
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

/**
 * DELETE /api/pets/:id
 * Remove a pet
 */
petRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await Pet.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).send({ error: "Pet not found" });
    }
    res.send({ message: "Pet deleted" });
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

/**
 * POST /api/pets/upload-image
 * Upload a new image for a pet
 */
petRouter.post("/upload-image", upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { petId } = req.body;
    
    if (!petId) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: "Pet ID is required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Find the pet to update
    const pet = await Pet.findById(petId);
    if (!pet) {
      // Clean up uploaded file if pet not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: "Pet not found" });
    }

    // Delete old image if it exists and it's an uploaded image (not an asset)
    if (pet.imageUrl && pet.imageUrl.startsWith('/uploads/')) {
      const oldImagePath = path.join(__dirname, '../../', pet.imageUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update pet with new image URL
    const newImageUrl = `/uploads/${req.file.filename}`;
    const updatedPet = await Pet.findByIdAndUpdate(
      petId, 
      { imageUrl: newImageUrl }, 
      { new: true }
    );

    res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl: newImageUrl,
      pet: updatedPet
    });
  } catch (error) {
    // Clean up uploaded file if there's an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error("Error uploading pet image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

export default petRouter;
