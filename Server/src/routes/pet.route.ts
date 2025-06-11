/**
 * Pet Schema model for MongoDB using Mongoose.
 * Defines the structure for pet documents.
 */

import { Router, Request, Response } from "express";
import Pet from "../models/petSchema";
import User from "../models/userSchema"; 
import mongoose from "mongoose";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const petRouter = Router();

// Create uploads directory for pets if it doesn't exist
const petUploadsDir = path.join(__dirname, '../../UserUploads');
if (!fs.existsSync(petUploadsDir)) {
  fs.mkdirSync(petUploadsDir, { recursive: true });
}

// Configure multer for pet image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, petUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'pet-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
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
 * Get pets by an array of IDs (only active pets)
 */
petRouter.post("/byIds", async (req: Request, res: Response) => {
  try {
    let ids = req.body.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).send({ error: "No IDs provided" });
    }
    // Convert all IDs to ObjectId for the query
    ids = ids.map((id: string) => new mongoose.Types.ObjectId(id));
    const allPets = await Pet.find({ _id: { $in: ids } });
    
    // Filter for active pets only
    const activePets = allPets.filter(pet => 
      pet.isActive && pet.isActive.toString().toLowerCase() === 'true'
    );
    
    res.send(activePets);
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
    const pet = new Pet({ name, type, breed, birthYear, weight, sex, isActive, prescriptions, treatments, owner });
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
 * Upload an image for a pet
 */
petRouter.post("/upload-image", upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).send({ error: "No image file provided" });
    }

    const { petId } = req.body;
    if (!petId) {
      return res.status(400).send({ error: "Pet ID is required" });
    }

    // Construct the image URL
    const imageUrl = `/uploads/${req.file.filename}`;

    // Update the pet with the new image URL
    const updatedPet = await Pet.findByIdAndUpdate(
      petId, 
      { imageUrl: imageUrl }, 
      { new: true }
    );

    if (!updatedPet) {
      // Clean up uploaded file if pet not found
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
      return res.status(404).send({ error: "Pet not found" });
    }

    res.status(200).send({ 
      message: "Image uploaded successfully", 
      imageUrl: imageUrl,
      pet: updatedPet
    });
  } catch (error) {
    // Clean up uploaded file if there's an error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    console.error('Error uploading pet image:', error);
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

export default petRouter;
