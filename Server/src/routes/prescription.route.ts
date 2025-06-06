/**
 * Prescription Schema management for MongoDB using Mongoose.
 * Defines the structure for prescription documents.
 */

import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import Prescription from "../models/prescriptionSchema";
import Pet from "../models/petSchema";

const prescriptionRouter = Router();

/**
 * GET /api/prescriptions
 * Get all prescriptions
 */
prescriptionRouter.get("/", async (req: Request, res: Response) => {
  try {
    const prescriptions = await Prescription.find().sort({ issueDate: -1 });
    res.send(prescriptions);
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

/**
 * GET /api/prescriptions/:id
 * Get a single prescription by its ID
 */
prescriptionRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).send({ error: "Prescription not found" });
    }
    res.send(prescription);
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

/**
 * POST /api/prescriptions
 * Create a new prescription and add its ID to the pet's prescriptions array
 */
prescriptionRouter.post("/", async (req: Request, res: Response) => {
  try {
    // Create the prescription
    const prescription = new Prescription(req.body);
    await prescription.save();    
    // First, verify the pet exists
    const petExists = await Pet.findById(prescription.petId);
    
    if (petExists) {
      // Add prescription ID to the pet's prescriptions array
      const petUpdate = await Pet.findByIdAndUpdate(
        prescription.petId,
        { $addToSet: { prescriptions: prescription._id } },
        { new: true }
      );
      }
    
    res.status(201).send(prescription);
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

/**
 * PUT /api/prescriptions/:id
 * Update a prescription
 */
prescriptionRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const updated = await Prescription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).send({ error: "Prescription not found" });
    }
    res.send(updated);
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

/**
 * DELETE /api/prescriptions/:id
 * Remove a prescription
 */
prescriptionRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).send({ error: "Prescription not found" });
    }
    
    // Remove prescription ID from the pet's prescriptions array
    await Pet.findByIdAndUpdate(
      prescription.petId,
      { $pull: { prescriptions: prescription._id } },
      { new: true }
    );
    
    // Delete the prescription
    await Prescription.findByIdAndDelete(req.params.id);
    
    res.send({ message: "Prescription deleted" });
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

/**
 * POST /api/prescriptions/byIds
 * Fetch prescriptions by an array of IDs
 */
prescriptionRouter.post("/byIds", async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).send({ error: "Invalid or empty IDs array" });
    }

    const prescriptions = await Prescription.find({ _id: { $in: ids } });
    res.send(prescriptions);
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

/**
 * POST /api/prescriptions/byPetIds
 * Fetch prescriptions by an array of pet IDs
 */
prescriptionRouter.post("/byPetIds", async (req: Request, res: Response) => {
  try {
    const { petIds } = req.body;
    if (!Array.isArray(petIds) || petIds.length === 0) {
      return res.status(400).send({ error: "Invalid or empty petIds array" });
    }
    // Convert string IDs to ObjectId
    const objectIds = petIds.map((id: string) => new mongoose.Types.ObjectId(id));
    const prescriptions = await Prescription.find({ petId: { $in: objectIds } });
    res.send(prescriptions);
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

export default prescriptionRouter;
