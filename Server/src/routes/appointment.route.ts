/**
 * Appointment routes for managing appointment data.
 */

import { Router, Request, Response } from "express";
import Appointment, { AppointmentStatus, AppointmentType } from "../models/appointmentSchema";
import mongoose, { Types } from "mongoose";
import * as ExcelJS from 'exceljs';
import { sendEmergencyCancelEmail, sendEmergencyVetAlertEmail, sendEmergencySecretaryAlertEmail } from "../services/emailService";
import User from "../models/userSchema";
import { findAvailableVetForEmergency, createAppointment } from "../services/appointmentService";
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
 * POST /api/appointments/emergency
 * ---------------------------------------------------------------
 * • Chooses the most available veterinarian for an emergency.
 * • Cancels that vet’s appointments **starting within the next
 *   4 hours** and emails the affected clients.
 * • Sends an alert email to the veterinarian.
 * • Creates a new emergency appointment (flat cost: ₪1000).
 * • Responds with:
 *      – the veterinarian’s details
 *      – the list of cancelled appointments
 *      – the newly created emergency appointment
 * ---------------------------------------------------------------
 * Request-body JSON
 * {
 *   userId:          string,   // pet owner’s Mongo ObjectId
 *   petId:           string,   // pet’s Mongo ObjectId
 *   description:     string,   // what happened
 *   emergencyReason: string    // optional tag for statistics
 * }
 * ---------------------------------------------------------------
 */
/**
 * POST /api/appointments/emergency
 * Schedules an emergency appointment with the best-available veterinarian.
 * - Cancels non-uncancellable appointments if needed.
 * - Never cancels or overlaps SURGERY appointments.
 * - Sends notifications to clients, vet, secretary, and pet owner.
 * - Returns detailed info on the action performed.
 */
appointmentRouter.post(
  "/emergency",
  async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      // 0) Validate input
      const { userId, petId, description, emergencyReason } = req.body;
      if (!userId || !petId || !description) {
        return res.status(400).json({
          error: "Missing required fields (userId, petId, description)."
        });
      }

      // 1) Find the best-available veterinarian for the emergency
      const now = new Date();
      let vet, toCancel;
      try {
        const result = await findAvailableVetForEmergency(now);
        vet = result.vet;
        toCancel = result.toCancel;
      } catch (err: any) {
        // Specific handling if no vet is available for the emergency window
        if (
          err instanceof Error &&
          (
            err.message === "No active veterinarians found." ||
            err.message === "No available vet found for the emergency window."
          )
        ) {
          return res.status(503).json({
            error:
              "No veterinarians are currently available for an emergency appointment. Please arrive at the clinic and a veterinarian will be assigned as soon as possible."
          });
        }
        // For other errors, continue to default error handling below
        throw err;
      }

      // 2) Cancel overlapping (cancellable) appointments & notify clients
      const cancelledAppointments: typeof toCancel = [];
      for (const appt of toCancel) {
        appt.status = AppointmentStatus.CANCELLED;
        await appt.save();
        cancelledAppointments.push(appt);

        // Notify the affected client via email
        const user = await User.findById(appt.userId);
        if (user?.email) {
          await sendEmergencyCancelEmail(
            user.email,
            appt.date,
            `${vet.firstName} ${vet.lastName}`
          );
        }
      }

      // 3) Notify the vet about the emergency
      if (vet.email) {
        await sendEmergencyVetAlertEmail(
          vet.email,
          now,
          description,
          emergencyReason
        );
      }

      // Helper: Formats Date to "hh:mm AM/PM"
      function formatTimeTo12h(date: Date): string {
        let h = date.getHours();
        const m = date.getMinutes().toString().padStart(2, "0");
        const period = h >= 12 ? "PM" : "AM";
        h = h % 12;
        if (h === 0) h = 12;
        return `${h}:${m} ${period}`;
      }

      // 4) Create the emergency appointment (2 hours)
      const vetId = (vet._id as Types.ObjectId).toString(); // safe cast
      const timeStr = formatTimeTo12h(now);
      const emergencyAppt = await createAppointment(
        userId,
        petId,
        vetId,
        now,
        timeStr,             // display-only time string
        "emergency_care",    // AppointmentType value
        description
      );
      emergencyAppt.isEmergency = true;
      emergencyAppt.emergencyReason = emergencyReason ?? "";
      emergencyAppt.cost = 1000;
      emergencyAppt.duration = 120; // Emergency appointment: 2 hours
      await emergencyAppt.save();

      // 4.5) Notify the secretary (do not interrupt flow if fails)
      try {
        await sendEmergencySecretaryAlertEmail({
          userId,
          petId,
          vetId,
          date: now,
          time: timeStr,
          description,
          emergencyReason: emergencyReason ?? ""
        });
      } catch (err) {
        console.error("Failed to notify secretary about emergency appointment:", err);
      }

      // 4.6) Notify the pet owner (do not interrupt flow if fails)
      try {
        // Fetch user, pet, and vet details for the email
        const [user, pet, vetObj] = await Promise.all([
          User.findById(userId),
          require("../models/petSchema").default.findById(petId),
          require("../models/staffSchema").default.findById(vetId)
        ]);
        if (user?.email && pet && vetObj) {
          const vetName = `${vetObj.firstName} ${vetObj.lastName}`;
          await require("../services/emailService").sendEmergencyOwnerConfirmationEmail({
            to: user.email,
            petName: pet.name,
            vetName,
            date: now,
            time: timeStr,
            description,
            emergencyReason: emergencyReason ?? ""
          });
        }
      } catch (err) {
        console.error("Failed to notify pet owner about emergency appointment:", err);
      }

      // 5) Success response
      return res.status(201).json({
        message: "Emergency appointment scheduled.",
        vet: {
          _id: vetId,
          firstName: vet.firstName,
          lastName: vet.lastName,
          email: vet.email
        },
        cancelledAppointments,
        newAppointment: emergencyAppt
      });
    } catch (err: any) {
      // Log all unexpected errors
      console.error("Error scheduling emergency appointment:", err);
      return res.status(500).json({
        error: err instanceof Error ? err.message : "Unknown error"
      });
    }
  }
);


/**
 * GET /api/appointments/export-excel
 * Export appointments to Excel file with professional styling
 * Query params:
 * - date: YYYY-MM-DD format to filter by specific date (optional)
 * - startDate & endDate: Date range filter (optional)
 */
appointmentRouter.get('/export-excel', async (req: Request, res: Response) => {
  try {
    const { date, startDate, endDate } = req.query;
    
    // Build filter object for appointments
    const filter: any = {};
    let dateDisplay = 'All';
    
    if (date) {
      const targetDate = new Date(date as string);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      filter.date = { $gte: targetDate, $lt: nextDate };
      dateDisplay = new Date(date as string).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (startDate && endDate) {
      filter.date = { 
        $gte: new Date(startDate as string), 
        $lte: new Date(endDate as string) 
      };
      dateDisplay = `${new Date(startDate as string).toLocaleDateString('en-US')} - ${new Date(endDate as string).toLocaleDateString('en-US')}`;
    }

    // Fetch appointments with populated data
    const appointments = await Appointment.find(filter)
      .populate('userId', 'firstName lastName email phone')
      .populate('petId', 'name type breed age')
      .populate('staffId', 'firstName lastName role')
      .sort({ date: 1, time: 1 });    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Appointments', {
      pageSetup: {
        paperSize: 9, // A4
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        margins: { 
          left: 0.5, 
          right: 0.5, 
          top: 0.75, 
          bottom: 0.75,
          header: 0.3,
          footer: 0.3
        }
      }
    });

    // Set metadata
    workbook.creator = 'Veterinary Clinic Management System';
    workbook.created = new Date();
    workbook.modified = new Date();

    let currentRow = 1;

    // Title section
    worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
    const titleCell = worksheet.getCell(`A${currentRow}`);
    titleCell.value = '🏥 VETERINARY CLINIC - APPOINTMENTS REPORT';
    titleCell.style = {
      font: { bold: true, size: 16, color: { argb: 'FF1F2937' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'double', color: { argb: 'FF374151' } },
        bottom: { style: 'double', color: { argb: 'FF374151' } },
        left: { style: 'double', color: { argb: 'FF374151' } },
        right: { style: 'double', color: { argb: 'FF374151' } }
      }
    };
    currentRow += 2;

    // Date range info
    worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
    const dateCell = worksheet.getCell(`A${currentRow}`);
    dateCell.value = `📅 Report Date Range: ${dateDisplay}`;
    dateCell.style = {
      font: { bold: true, size: 11, color: { argb: 'FF374151' } },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };
    currentRow += 2;

    // Summary statistics
    const totalAppointments = appointments.length;
    const scheduledCount = appointments.filter(apt => apt.status === AppointmentStatus.SCHEDULED).length;
    const completedCount = appointments.filter(apt => apt.status === AppointmentStatus.COMPLETED).length;
    const cancelledCount = appointments.filter(apt => apt.status === AppointmentStatus.CANCELLED).length;
    const totalRevenue = appointments
      .filter(apt => apt.status === AppointmentStatus.COMPLETED)
      .reduce((sum, apt) => sum + (apt.cost || 0), 0);

    // Summary header
    worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
    const summaryHeaderCell = worksheet.getCell(`A${currentRow}`);
    summaryHeaderCell.value = '📊 SUMMARY STATISTICS';
    summaryHeaderCell.style = {
      font: { bold: true, size: 12, color: { argb: 'FF1F2937' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } },
      alignment: { horizontal: 'left', vertical: 'middle' },
      border: {
        top: { style: 'double', color: { argb: 'FF6B7280' } },
        bottom: { style: 'medium', color: { argb: 'FF9CA3AF' } },
        left: { style: 'medium', color: { argb: 'FF9CA3AF' } },
        right: { style: 'medium', color: { argb: 'FF9CA3AF' } }
      }
    };
    currentRow++;

    // Summary data
    const summaryData = [
      ['Total Appointments:', totalAppointments],
      ['Scheduled:', scheduledCount],
      ['Completed:', completedCount],
      ['Cancelled:', cancelledCount],
      ['Total Revenue:', `$${totalRevenue.toFixed(2)}`]
    ];

    summaryData.forEach(([label, value]) => {
      const labelCell = worksheet.getCell(`A${currentRow}`);
      const valueCell = worksheet.getCell(`B${currentRow}`);
      
      labelCell.value = label;
      valueCell.value = value;
      
      // Style summary cells
      labelCell.style = {
        font: { bold: true, color: { argb: 'FF374151' } },
        alignment: { horizontal: 'left', vertical: 'middle' },
        border: {
          top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          left: { style: 'medium', color: { argb: 'FF9CA3AF' } },
          right: { style: 'hair', color: { argb: 'FFE5E7EB' } }
        }
      };
      
      valueCell.style = {
        font: { color: { argb: 'FF4B5563' } },
        alignment: { horizontal: 'left', vertical: 'middle' },
        border: {
          top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          left: { style: 'hair', color: { argb: 'FFE5E7EB' } },
          right: { style: 'medium', color: { argb: 'FF9CA3AF' } }
        }
      };
      
      currentRow++;
    });

    // Add detailed appointments section
    currentRow += 2;
    worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
    const sectionCell = worksheet.getCell(`A${currentRow}`);
    sectionCell.value = '📋 DETAILED APPOINTMENTS';
    sectionCell.style = {
      font: { bold: true, size: 12, color: { argb: 'FF1F2937' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } },
      alignment: { horizontal: 'left', vertical: 'middle' },
      border: {
        top: { style: 'double', color: { argb: 'FF6B7280' } },
        bottom: { style: 'medium', color: { argb: 'FF9CA3AF' } },
        left: { style: 'medium', color: { argb: 'FF9CA3AF' } },
        right: { style: 'medium', color: { argb: 'FF9CA3AF' } }
      }
    };
    currentRow++;

    // Table headers
    const headers = [
      'Date', 'Time', 'Client', 'Pet', 'Service Type', 
      'Veterinarian', 'Duration', 'Cost', 'Status'
    ];
    
    const columnWidths = [12, 10, 18, 15, 20, 18, 10, 10, 12];
    
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(currentRow, index + 1);
      cell.value = header;
      cell.style = {
        font: { bold: true, color: { argb: 'FFFFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: {
          top: { style: 'medium', color: { argb: 'FF065F46' } },
          bottom: { style: 'medium', color: { argb: 'FF065F46' } },
          left: { style: 'thin', color: { argb: 'FF10B981' } },
          right: { style: 'thin', color: { argb: 'FF10B981' } }
        }
      };
    });
    currentRow++;

    // Add appointment data
    appointments.forEach((appointment, index) => {
      const rowData = [
        new Date(appointment.date).toLocaleDateString('en-US'),
        appointment.time,
        `${(appointment.userId as any)?.firstName || ''} ${(appointment.userId as any)?.lastName || ''}`.trim() || 'N/A',
        (appointment.petId as any)?.name || 'N/A',
        appointment.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
        `${(appointment.staffId as any)?.firstName || ''} ${(appointment.staffId as any)?.lastName || ''}`.trim() || 'N/A',
        `${appointment.duration} min`,
        `$${(appointment.cost || 0).toFixed(2)}`,
        appointment.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
      ];

      rowData.forEach((data, colIndex) => {
        const cell = worksheet.getCell(currentRow, colIndex + 1);
        cell.value = data;
        
        // Alternate row colors
        const fillColor = index % 2 === 0 ? 'FFFFFFFF' : 'FFF9FAFB';
        
        cell.style = {
          alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
          border: {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
          },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } }
        };
        
        // Status-specific styling
        if (colIndex === 8) { // Status column
          let statusColor = 'FF374151'; // Default
          if (appointment.status === AppointmentStatus.COMPLETED) statusColor = 'FF059669';
          else if (appointment.status === AppointmentStatus.CANCELLED) statusColor = 'FFDC2626';
          else if (appointment.status === AppointmentStatus.SCHEDULED) statusColor = 'FF2563EB';
          
          cell.style.font = { bold: true, color: { argb: statusColor } };
        }
      });
      currentRow++;
    });

    // Set column widths
    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width;
    });

    // Set row heights
    worksheet.getRow(1).height = 40; // Title row
    for (let i = currentRow - appointments.length; i < currentRow; i++) {
      worksheet.getRow(i).height = 25;
    }    // Generate Excel file buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Set response headers for file download
    const fileName = `Appointments_${date || 'All'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', Buffer.byteLength(buffer).toString());

    // Send the buffer
    res.end(buffer);

  } catch (error) {
    console.error("Error exporting appointments to Excel:", error);
    res.status(500).json({ error: "Failed to export appointments to Excel" });
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

    if (!mongoose.Types.ObjectId.isValid(userId) || 
        !mongoose.Types.ObjectId.isValid(petId) || 
        !mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }


    // Validate appointment type
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
    const appointmentData = {
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
    };


    const newAppointment = new Appointment(appointmentData);
    const savedAppointment = await newAppointment.save();
    
    // Populate the response
    const populatedAppointment = await Appointment.findById(savedAppointment._id)
      .populate('userId', 'firstName lastName email phone')
      .populate('petId', 'name type breed')
      .populate('staffId', 'firstName lastName role specialization');

    res.status(201).json({
      message: "Appointment created successfully",
      appointment: populatedAppointment
    });  } catch (error: any) {
    console.error("=== APPOINTMENT CREATION ERROR ===");
    console.error("Error type:", typeof error);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error stack:", error.stack);
    console.error("Full error object:", error);
    
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: "This time slot is already booked for the selected staff member" 
      });
    }
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: "Validation failed: " + Object.values(error.errors).map((e: any) => e.message).join(', ')
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
    const { cancelReason } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid appointment ID" });
    }

    const update: any = { status: AppointmentStatus.CANCELLED };
    if (cancelReason) update.cancelReason = cancelReason;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      update,
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
