/**
 * Pet Schema model for MongoDB using Mongoose.
 * Defines the structure for pet documents.
 */

import { Router, Request, Response } from "express";
import Pet from "../models/petSchema";
import User from "../models/userSchema"; 
import mongoose from "mongoose";

const petRouter = Router();

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

export default petRouter;
