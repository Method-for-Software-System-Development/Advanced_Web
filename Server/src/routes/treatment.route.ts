/**
 * Treatment Schema
 * This file defines the routes for managing treatments in the application.
 */

import { Router, Request, Response } from "express";
import Treatment from "../models/treatmentSchema";

const treatmentRouter = Router();

/**
 * GET /api/treatments/:id
 * Get a single treatment by its ID
 */
treatmentRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const treatment = await Treatment.findById(req.params.id);
    if (!treatment) {
      return res.status(404).send({ error: "Treatment not found" });
    }
    res.send(treatment);
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

/**
 * GET /api/treatments/pet/:petId
 * Get all treatments for a specific pet
 */
treatmentRouter.get("/pet/:petId", async (req: Request, res: Response) => {
  try {
    const treatments = await Treatment.find({ petId: req.params.petId });
    res.send(treatments);
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

/**
 * POST /api/treatments
 * Create a new treatment
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
 * PUT /api/treatments/:id
 * Update a treatment
 */
treatmentRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const updated = await Treatment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).send({ error: "Treatment not found" });
    }
    res.send(updated);
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

/**
 * DELETE /api/treatments/:id
 * Remove a treatment
 */
treatmentRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await Treatment.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).send({ error: "Treatment not found" });
    }
    res.send({ message: "Treatment deleted" });
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

export default treatmentRouter;
