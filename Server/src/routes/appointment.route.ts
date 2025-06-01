/**
 * Appointment routes for managing appointment data.
 */

import { Router, Request, Response } from "express";
import Appointment, { AppointmentStatus, AppointmentType } from "../models/appointmentSchema";
import mongoose from "mongoose";

const appointmentRouter = Router();

/**
 * GET /api/appointments
 * Get all appointments with optional filtering
 * Query params: 
 * - date: YYYY-MM-DD format to filter by specific date
 * - staffId: Filter by staff member
 * - userId: Filter by user
 * - petId: Filter by pet
 * - status: Filter by appointment status
 * - startDate & endDate: Date range filter
 */
appointmentRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { date, staffId, userId, petId, status, startDate, endDate } = req.query;
    
    // Build filter object
    const filter: any = {};
    
    if (date) {
      const targetDate = new Date(date as string);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      filter.date = { $gte: targetDate, $lt: nextDate };
    }
    
    if (startDate && endDate) {
      filter.date = { 
        $gte: new Date(startDate as string), 
        $lte: new Date(endDate as string) 
      };
    }
    
    if (staffId) filter.staffId = staffId;
    if (userId) filter.userId = userId;
    if (petId) filter.petId = petId;
    if (status) filter.status = status;
    
    const appointments = await Appointment.find(filter)
      .populate('userId', 'firstName lastName email phone')
      .populate('petId', 'name type breed')
      .populate('staffId', 'firstName lastName role specialization')
      .sort({ date: 1, time: 1 });
    
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

/**
 * GET /api/appointments/:id
 * Get a single appointment by ID
 */
appointmentRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid appointment ID" });
    }
    
    const appointment = await Appointment.findById(id)
      .populate('userId', 'firstName lastName email phone')
      .populate('petId', 'name type breed birthYear weight')
      .populate('staffId', 'firstName lastName role specialization');
    
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    
    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ error: "Failed to fetch appointment" });
  }
});

/**
 * POST /api/appointments
 * Create a new appointment
 */
appointmentRouter.post("/", async (req: Request, res: Response) => {
  try {
    const {
      userId,
      petId,
      staffId,
      date,
      time,
      duration,
      type,
      description,
      notes,
      cost
    } = req.body;

    // Validate required fields
    if (!userId || !petId || !staffId || !date || !time || !type || !description) {
      return res.status(400).json({ 
        error: "Missing required fields: userId, petId, staffId, date, time, type, description" 
      });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId) || 
        !mongoose.Types.ObjectId.isValid(petId) || 
        !mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }    // Validate appointment type
    if (!Object.values(AppointmentType).includes(type)) {
      return res.status(400).json({ error: "Invalid appointment type" });
    }

    // Validate date is not in the past
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
      return res.status(400).json({ error: "Cannot schedule appointments in the past" });
    }    // Helper function to convert time string to minutes since midnight
    const timeToMinutes = (timeStr: string): number => {
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let totalMinutes = hours * 60 + minutes;
      
      if (period === 'PM' && hours !== 12) {
        totalMinutes += 12 * 60;
      } else if (period === 'AM' && hours === 12) {
        totalMinutes = minutes; // 12:xx AM is 00:xx in 24-hour format
      }
      
      return totalMinutes;
    };

    // Check for time overlaps with existing appointments
    const existingAppointments = await Appointment.find({
      staffId,
      date: appointmentDate,
      status: { $nin: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] }
    });

    const newStartMinutes = timeToMinutes(time);
    const newEndMinutes = newStartMinutes + (duration || 30);    for (const existing of existingAppointments) {
      const existingStartMinutes = timeToMinutes(existing.time);
      const existingEndMinutes = existingStartMinutes + existing.duration;

      // Check if appointments overlap - appointments overlap if they share any time
      const isOverlapping = (
        newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes
      );

      if (isOverlapping) {
        return res.status(409).json({ 
          error: `Time slot conflicts with existing appointment from ${existing.time} (${existing.duration} minutes)` 
        });
      }
    }

    const newAppointment = new Appointment({
      userId,
      petId,
      staffId,
      date: appointmentDate,
      time,
      duration: duration || 30,
      type,
      description,
      notes,
      cost,
      status: AppointmentStatus.SCHEDULED
    });

    const savedAppointment = await newAppointment.save();
    
    // Populate the response
    const populatedAppointment = await Appointment.findById(savedAppointment._id)
      .populate('userId', 'firstName lastName email phone')
      .populate('petId', 'name type breed')
      .populate('staffId', 'firstName lastName role specialization');

    res.status(201).json({
      message: "Appointment created successfully",
      appointment: populatedAppointment
    });
  } catch (error: any) {
    console.error("Error creating appointment:", error);
    
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: "This time slot is already booked for the selected staff member" 
      });
    }
    
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

/**
 * PUT /api/appointments/:id
 * Update an appointment
 */
appointmentRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      date,
      time,
      duration,
      type,
      status,
      description,
      notes,
      cost
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid appointment ID" });
    }

    const existingAppointment = await Appointment.findById(id);
    if (!existingAppointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Build update object
    const updateData: any = {};
    
    if (date !== undefined) updateData.date = new Date(date);
    if (time !== undefined) updateData.time = time;
    if (duration !== undefined) updateData.duration = duration;
    if (type !== undefined) {
      if (!Object.values(AppointmentType).includes(type)) {
        return res.status(400).json({ error: "Invalid appointment type" });
      }
      updateData.type = type;
    }
    if (status !== undefined) {
      if (!Object.values(AppointmentStatus).includes(status)) {
        return res.status(400).json({ error: "Invalid appointment status" });
      }
      updateData.status = status;
    }
    if (description !== undefined) updateData.description = description;
    if (notes !== undefined) updateData.notes = notes;
    if (cost !== undefined) updateData.cost = cost;

    // Check for conflicts if date/time is being changed
    if ((date !== undefined || time !== undefined) && status !== AppointmentStatus.CANCELLED) {
      const newDate = date ? new Date(date) : existingAppointment.date;
      const newTime = time || existingAppointment.time;
      
      const conflictingAppointment = await Appointment.findOne({
        _id: { $ne: id },
        staffId: existingAppointment.staffId,
        date: newDate,
        time: newTime,
        status: { $nin: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] }
      });

      if (conflictingAppointment) {
        return res.status(409).json({ 
          error: "Staff member already has an appointment at this time" 
        });
      }
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('userId', 'firstName lastName email phone')
     .populate('petId', 'name type breed')
     .populate('staffId', 'firstName lastName role specialization');

    res.status(200).json({
      message: "Appointment updated successfully",
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ error: "Failed to update appointment" });
  }
});

/**
 * DELETE /api/appointments/:id
 * Cancel an appointment (soft delete)
 */
appointmentRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid appointment ID" });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { status: AppointmentStatus.CANCELLED },
      { new: true }
    ).populate('userId', 'firstName lastName email phone')
     .populate('petId', 'name type breed')
     .populate('staffId', 'firstName lastName role specialization');

    if (!updatedAppointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.status(200).json({
      message: "Appointment cancelled successfully",
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
});

/**
 * PATCH /api/appointments/:id/status
 * Update appointment status
 */
appointmentRouter.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid appointment ID" });
    }

    if (!Object.values(AppointmentStatus).includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('userId', 'firstName lastName email phone')
     .populate('petId', 'name type breed')
     .populate('staffId', 'firstName lastName role specialization');

    if (!updatedAppointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.status(200).json({
      message: `Appointment status updated to ${status}`,
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ error: "Failed to update appointment status" });
  }
});

export default appointmentRouter;
