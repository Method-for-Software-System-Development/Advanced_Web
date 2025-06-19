/**
 * Staff routes for managing staff member data.
 */

import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Staff, { StaffRole } from "../models/staffSchema";

const staffRouter = Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads/staff');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
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
 * GET /api/staff
 * Get all staff members
 * Query params: includeInactive=true to include inactive staff, role=veterinarian to filter by role
 */
staffRouter.get("/", async (req: Request, res: Response) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const roleFilter = req.query.role as string;
    
    let filter: any = {};
    
    if (!includeInactive) {
      filter.isActive = true;
    }
    
    if (roleFilter && Object.values(StaffRole).includes(roleFilter as StaffRole)) {
      filter.role = roleFilter;
    }

    const staff = await Staff.find(filter).sort({ createdAt: 1 });
    res.status(200).json(staff);
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({ error: "Failed to fetch staff members" });
  }
});
/**
 * GET /api/staff/search?name=Levin
 * Returns a staff member by name (first+last or just last), case-insensitive.
 * Supports: "Levin", "Micheal Levin", "Dr Levin", "Dr Micheal Levin"
 */
staffRouter.get("/search", async (req, res) => {
  try {
    const q = String(req.query.name || "").trim();
    if (!q) return res.status(400).json({ error: "name query is required" });

    // Remove possible leading 'Dr ' or 'dr. '
    const clean = q.replace(/^dr\.?\s+/i, "");

    // Try matching full name (firstName + lastName)
    const nameParts = clean.split(/\s+/).filter(Boolean);
    let staff = null;

    // 1. Try exact full name (case-insensitive)
    if (nameParts.length >= 2) {
      staff = await Staff.findOne({
        isActive: true,
        firstName: { $regex: new RegExp(`^${nameParts[0]}$`, "i") },
        lastName:  { $regex: new RegExp(`^${nameParts.slice(1).join(" ")}$`, "i") }
      });
    }
    // 2. Try by last name only
    if (!staff && nameParts.length >= 1) {
      staff = await Staff.findOne({
        isActive: true,
        lastName: { $regex: new RegExp(`^${nameParts[nameParts.length - 1]}$`, "i") }
      });
    }

    if (!staff) return res.status(404).json({ error: "Staff member not found" });
    res.status(200).json(staff);
  } catch (error) {
    console.error("Error searching staff by name:", error);
    res.status(500).json({ error: "Failed to fetch staff member" });
  }
});
/* ─────────────────────────  Helper: normaliseSpecialty  ─────────────────── */
/**
 * Converts a user-typed profession (e.g. “cardiologist”, “receptionist”)
 * to the wording that is actually stored in MongoDB.
 *
 * Logic order
 * -----------
 * 1. Exact alias table (ALIAS_MAP) — fastest path.  
 * 2. Generic “…ologist” → “…ology”  → *neurologist* → *neurology*.  
 * 3. Generic “…ist”     → “…y”      → *therapist*   → *therapy*.  
 * 4. Fallback: capitalise word as-is (so “surgery” stays “Surgery”).
 *
 * The result is returned in **title case** so it can be used directly
 * in UI or passed to the REST endpoint.
 */
function normaliseSpecialty(raw: string): string {
  const ALIAS_MAP: Record<string, string> = {
    cardiologist:  "Cardiology",
    neurologist:   "Neurology",
    dermatologist: "Dermatology",
    surgeon:       "Surgery",

    /* non-veterinarian roles */
    receptionist:  "Clinic Receptionist",
    secretary:     "Clinic Receptionist",
    "vet assistant": "Veterinary Assistant",
    nurse:         "Veterinary Assistant"
  };

  const lower = raw.trim().toLowerCase();
  if (ALIAS_MAP[lower]) return ALIAS_MAP[lower];

  /* “…ologist” → “…ology”  (neurologist → neurology) */
  if (lower.endsWith("ologist")) {
    return `${lower.slice(0, -3)}y`;     // remove “ist”, add “y”
  }

  /* “…ist” → “…y”  (therapist → therapy) */
  if (lower.endsWith("ist")) {
    return `${lower.slice(0, -3)}y`;
  }

  /* default: Title-case the cleaned string */
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/* ───────────────────  GET /api/staff/search/specialty  ──────────────────── */
/**
 * URL example
 * -----------
 *   GET /api/staff/search/specialty?specialization=Cardiology
 *
 * Behaviour
 * ---------
 * • Looks for *active* staff whose **specialization** **or** **role**
 *   contains the requested phrase.
 * • Matching is case-insensitive and white-space agnostic
 *   (“clinic receptionist” === “clinic    receptionist”).
 * • If nothing is found → 404 with a clear JSON error.
 * • Any server error → 500 with `"Failed to search staff member by specialization"`.
 */
staffRouter.get(
  "/search/specialty",
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const raw = String(req.query.specialization ?? "").trim();
      if (!raw) {
        return res.status(400).json({ error: "specialization query is required" });
      }

      /* Collapse extra spaces and escape RegExp meta-chars */
      const collapsed = raw.replace(/\s+/g, " ").toLowerCase();
      const escaped   = collapsed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      /* Allow ANY white-space between words stored in DB */
      const rxAny = new RegExp(escaped.split(" ").join("\\s+"), "i");

      const staffList = await Staff.find({
        isActive: true,
        $or: [{ specialization: rxAny }, { role: rxAny }]
      });

      if (!staffList.length) {
        return res
          .status(404)
          .json({ error: "No staff found with this specialization or role" });
      }

      return res.json(staffList);
    } catch (err) {
      console.error("Error searching staff by specialization:", err);
      return res
        .status(500)
        .json({ error: "Failed to search staff member by specialization" });
    }
  }
);



/**
 * GET /api/staff/:id
 * Get a specific staff member by ID
 */
staffRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const staffMember = await Staff.findById(id);
    
    if (!staffMember) {
      return res.status(404).json({ error: "Staff member not found" });
    }
    
    res.status(200).json(staffMember);
  } catch (error) {
    console.error("Error fetching staff member:", error);
    res.status(500).json({ error: "Failed to fetch staff member" });
  }
});

/**
 * POST /api/staff
 * Create a new staff member (with optional image upload)
 */
staffRouter.post("/", upload.single('image'), async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      role,
      specialization,
      licenseNumber,
      yearsOfExperience,
      description,
      availableSlots
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !role || yearsOfExperience === undefined) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate role
    if (!Object.values(StaffRole).includes(role)) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: "Invalid role specified" });
    }

    // For veterinarians, specialization and license are typically required
    if (role === StaffRole.VETERINARIAN && (!specialization || !licenseNumber)) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: "Veterinarians must have specialization and license number" });
    }

    // Parse availableSlots if it's a string
    let parsedSlots = [];
    if (availableSlots) {
      try {
        parsedSlots = typeof availableSlots === 'string' ? JSON.parse(availableSlots) : availableSlots;
      } catch (error) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ error: "Invalid availableSlots format" });
      }
    }

    // Prepare staff data
    const staffData: any = {
      firstName,
      lastName,
      email,
      phone,
      role,
      yearsOfExperience: parseInt(yearsOfExperience),
      description: description || '',
      availableSlots: parsedSlots
    };

    // Add optional fields
    if (specialization) {
      staffData.specialization = specialization;
    }
    if (licenseNumber) {
      staffData.licenseNumber = licenseNumber;
    }

    // Add image URL if uploaded
    if (req.file) {
      staffData.imageUrl = `/uploads/staff/${req.file.filename}`;
    }

    const newStaff = new Staff(staffData);
    const savedStaff = await newStaff.save();
    
    res.status(201).json({
      message: "Staff member created successfully",
      staff: savedStaff
    });
  } catch (error: any) {
    // Clean up uploaded file if there's an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error("Error creating staff member:", error);
    
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ error: `${field} already exists` });
    }
    
    res.status(500).json({ error: "Failed to create staff member" });
  }
});

/**
 * PUT /api/staff/:id
 * Update a staff member (with optional image upload)
 */
staffRouter.put("/:id", upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      role,
      specialization,
      licenseNumber,
      yearsOfExperience,
      description,
      availableSlots
    } = req.body;

    // Find existing staff member
    const existingStaff = await Staff.findById(id);
    if (!existingStaff) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: "Staff member not found" });
    }

    // Validate role if provided
    if (role && !Object.values(StaffRole).includes(role)) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: "Invalid role specified" });
    }

    // Parse availableSlots if provided
    let parsedSlots;
    if (availableSlots !== undefined) {
      try {
        parsedSlots = typeof availableSlots === 'string' ? JSON.parse(availableSlots) : availableSlots;
      } catch (error) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ error: "Invalid availableSlots format" });
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (role) updateData.role = role;
    if (specialization !== undefined) updateData.specialization = specialization;
    if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;
    if (yearsOfExperience !== undefined) updateData.yearsOfExperience = parseInt(yearsOfExperience);
    if (description !== undefined) updateData.description = description;
    if (parsedSlots !== undefined) updateData.availableSlots = parsedSlots;

    // Handle image upload
    if (req.file) {
      // Delete old image if it exists
      if (existingStaff.imageUrl) {
        const oldImagePath = path.join(__dirname, '../../', existingStaff.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.imageUrl = `/uploads/staff/${req.file.filename}`;
    }

    const updatedStaff = await Staff.findByIdAndUpdate(id, updateData, { new: true });
    
    res.status(200).json({
      message: "Staff member updated successfully",
      staff: updatedStaff
    });
  } catch (error: any) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error("Error updating staff member:", error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ error: `${field} already exists` });
    }
    
    res.status(500).json({ error: "Failed to update staff member" });
  }
});

/**
 * DELETE /api/staff/:id
 * Deactivate (soft delete) a staff member
 */
staffRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const updatedStaff = await Staff.findByIdAndUpdate(
      id, 
      { isActive: false }, 
      { new: true }
    );
    
    if (!updatedStaff) {
      return res.status(404).json({ error: "Staff member not found" });
    }
    
    res.status(200).json({
      message: "Staff member deactivated successfully",
      staff: updatedStaff
    });
  } catch (error) {
    console.error("Error deactivating staff member:", error);
    res.status(500).json({ error: "Failed to deactivate staff member" });
  }
});

/**
 * PUT /api/staff/:id/activate
 * Reactivate a staff member
 */
staffRouter.put("/:id/activate", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const updatedStaff = await Staff.findByIdAndUpdate(
      id, 
      { isActive: true }, 
      { new: true }
    );
    
    if (!updatedStaff) {
      return res.status(404).json({ error: "Staff member not found" });
    }
    
    res.status(200).json({
      message: "Staff member activated successfully",
      staff: updatedStaff
    });
  } catch (error) {
    console.error("Error activating staff member:", error);
    res.status(500).json({ error: "Failed to activate staff member" });
  }
});


export default staffRouter;
