// services/treatmentService.ts

import Treatment, { ITreatment } from "../models/treatmentSchema";

/**
 * Returns all treatments for a given pet, sorted by date (descending)
 * @param petId - Pet's ObjectId
 * @returns List of Treatment documents
 */
export async function getPetHistory(petId: string): Promise<ITreatment[]> {
  return Treatment.find({ petId }).sort({ visitDate: -1 });
}
