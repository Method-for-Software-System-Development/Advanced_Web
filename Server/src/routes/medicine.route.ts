/**
 * Medicine routes for managing medicine data.
 */

import { Router, Request, Response } from "express";
import Medicine from "../models/medicineSchema";

const medicineRouter = Router();

/**
 * GET /api/medicines
 * Get all medicines with optional search
 * Query params: 
 * - search: Search term to filter by medicine name, type, or referral
 */
medicineRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    
    let filter: any = {};
    
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      filter = {
        $or: [
          { Name: { $regex: searchRegex } },
          { Type: { $regex: searchRegex } },
          { Referral: { $regex: searchRegex } }
        ]
      };
    }
    
    const medicines = await Medicine.find(filter).sort({ Name: 1 });
    res.status(200).json(medicines);
  } catch (error) {
    console.error("Error fetching medicines:", error);
    res.status(500).json({ error: "Failed to fetch medicines" });
  }
});

/**
 * GET /api/medicines/:id
 * Get a specific medicine by ID
 */
medicineRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const medicine = await Medicine.findById(id);
    
    if (!medicine) {
      return res.status(404).json({ error: "Medicine not found" });
    }
    
    res.status(200).json(medicine);
  } catch (error) {
    console.error("Error fetching medicine:", error);
    res.status(500).json({ error: "Failed to fetch medicine" });
  }
});

export default medicineRouter;
