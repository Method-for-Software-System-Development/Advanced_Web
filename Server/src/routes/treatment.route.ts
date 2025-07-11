import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import Treatment from "../models/treatmentSchema";

const treatmentRouter = Router();

/**
 * GET /api/treatments/pet/:petId/sorted
 * Get all treatments for a specific pet, sorted by visitDate and visitTime descending
 */
treatmentRouter.get("/pet/:petId/sorted", async (req: Request, res: Response) => {
  try {
    const { petId } = req.params;
    let query: any = {};
    if (mongoose.Types.ObjectId.isValid(petId)) {
      query.petId = { $in: [petId, new mongoose.Types.ObjectId(petId)] };
    } else {
      query.petId = petId;
    }
    const treatments = await Treatment.find(query)
      .sort({ visitDate: -1, visitTime: -1 });
    res.send(treatments);
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
})

/**
 * POST /api/treatments
 * Create and save a new treatment
 */
treatmentRouter.post("/", async (req: Request, res: Response) => {
  try {
    const treatment = new Treatment(req.body);
    await treatment.save();
    res.status(201).send(treatment);
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

/**
 * POST /api/treatments/byPetIds
 * Get all treatments for a list of pet IDs
 */
treatmentRouter.post("/byPetIds", async (req: Request, res: Response) => {
  try {
    const { petIds } = req.body;
    if (!Array.isArray(petIds) || petIds.length === 0) {
      return res.status(400).send({ error: "petIds must be a non-empty array" });
    }
    // Support both string and ObjectId types
    const ids = petIds.map((id: string) =>
      mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
    );
    const treatments = await Treatment.find({ petId: { $in: ids } });
    res.send(treatments);
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

/**
 * POST /api/treatments/vetName
 * Get the full name (first + last) of a vet by vetId
 */
treatmentRouter.post("/vetName", async (req: Request, res: Response) => {
  try {
    const { vetId } = req.body;
    if (!vetId) {
      return res.status(400).json({ error: "vetId is required" });
    }
    const Staff = require("../models/staffSchema").default;
    const vet = await Staff.findById(vetId);
    if (!vet) {
      return res.status(404).json({ error: "Vet not found" });
    }
    return res.status(200).json({ fullName: `${vet.firstName} ${vet.lastName}` });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch vet name" });
  }
});

export default treatmentRouter;
