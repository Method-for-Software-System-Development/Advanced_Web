/**
 * Users API routes.
 * Defines all REST endpoints related to user management.
 */
import { sendPasswordResetEmail } from "../services/emailService";
import { Router, Request, Response } from 'express';
import User, { IUser } from '../models/userSchema';
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
const usersRouter = Router();

/**
 * GET /api/Users
 * Get all users
 * Query params: 
 */
usersRouter.get("/", async (req: Request, res: Response) => {
    try {    
        const users = await User.find().sort({ firstName: 1, lastName: 1 }).populate('pets');
        // Map DB fields to frontend Patient interface
        const mappedUsers = users.map((user: any) => ({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          street: user.street,
          city: user.city,
          postalCode: user.postalCode,
          contact: user.email,
          pets: user.pets || [],
        }));
        res.send(mappedUsers);
      } catch (error) {
        res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
      }
    });

/**
 * POST /api/users/register
 * Registers a new user. Expects JSON body with user data.
 */
usersRouter.post("/register", async (req: Request, res: Response) => { 
    try {
        const { firstName, lastName, email, phone, password,street, city, postalCode } = req.body;
        const user = new User({
            firstName,
            lastName,
            email,
            phone,
            password,
            street,
            city,
            postalCode,
            pets: [] 
        });
        await user.save();
        res.status(201).send({ message: "User registered successfully", user });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).send({ error: error.message });
        } else {
            res.status(500).send({ error: "An unknown error occurred" });
        }
    }
});

/**
 * PUT /api/users/update/:id
 * Updates an existing user. Expects JSON body with user data.
 */
usersRouter.put("/update/:id", async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, phone, street, city, postalCode } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { firstName, lastName, email, phone, street, city, postalCode },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).send({ error: "User not found" });
        }
        res.status(200).send({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).send({ error: error.message });
        } else {
            res.status(500).send({ error: "An unknown error occurred" });
        }
    }
});

/**
 * POST /api/users/login
 * Authenticates a user by email and password.
 * If successful, returns a JWT token for client authentication.
 */
usersRouter.post("/login", async (req: Request, res: Response) => {
    try {
        // 1. Extract email and password from request body
        const { email, password } = req.body;

        // 2. Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            // User not found
            return res.status(401).send({ error: "Invalid email or password" });
        }

        // 3. Compare given password with hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Password does not match
            return res.status(401).send({ error: "Invalid email or password" });
        }

        // 4. Create a JWT token with user info
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: "1h" }
        );

        // 5. Return user info and JWT token
        res.status(200).send({
            message: "Login successful",
            user,
            token
        });
    } catch (error) {
        res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
    }
});


/**
 * PUT /api/users/:id
 * Update user's email and phone
 */
usersRouter.put("/:id", async (req: Request, res: Response) => {
    try {
        const { email, phone } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { email, phone },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).send({ error: "User not found" });
        }
        res.status(200).send({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
    }
});

/**
 * GET /api/users
 * Retrieves all users.
 */
usersRouter.get("/", async (req: Request, res: Response) => {
    try {
        const users = await User.find().populate('pets'); // Populate pets if needed
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
    }
});

/**
 * GET /api/users/search
 * Searches for users by name or email.
 */
usersRouter.get("/search", async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string; // Changed from req.query.query
        if (!query) {
            return res.status(400).send({ error: "Search query is required" });
        }

        const users = await User.find({
            $or: [
                { firstName: { $regex: query, $options: "i" } },
                { lastName: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
            ],
        }).populate('pets'); // Populate pets if needed

        res.status(200).send(users);
    } catch (error) {
        res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
    }
});

/**
 * POST /api/users/forgot-password
 * Handles password reset requests by generating a 6-digit code,
 * saving it to the user's document, and sending it via email.
 * Expects: { email }
 * Returns: { message }
 */
usersRouter.post("/forgot-password", async (req: Request, res: Response) => {
  /**
   * Handles password reset requests by generating a 6-digit code,
   * saving it to the user's document, and sending it via email.
   */
  try {
    const { email } = req.body;
    if (!email) return res.status(400).send({ error: "Email is required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ error: "No user with that email address." });

    // Generate a 6-digit random code (as string)
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Set code and expiry for 15 minutes from now
    user.resetPasswordCode = code;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Send code via email
    await sendPasswordResetEmail(email, code);

    res.send({ message: "A verification code has been sent to your email address." });
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});
/**
 * POST /api/users/verify-reset-code
 * Verifies the reset code for a user's password reset request.
 * Expects: { email, code }
 */
usersRouter.post("/verify-reset-code", async (req: Request, res: Response) => {
  /**
   * Checks if the provided code and email match a valid password reset request.
   */
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).send({ error: "Email and code are required." });

    const user = await User.findOne({
      email,
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: new Date() }, // code is still valid
    });

    if (!user) return res.status(400).send({ error: "Invalid or expired code." });

    res.send({ message: "Code verified successfully." });
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

/**
 * POST /api/users/reset-password
 * Resets the user's password after verifying the code and email.
 * Expects: { email, code, password }
 * Returns: { message }
 */
usersRouter.post("/reset-password", async (req: Request, res: Response) => {
  /**
   * Resets the user's password after validating the reset code and expiry.
   * The code and expiry are then cleared from the user document.
   */
  try {
    const { email, code, password } = req.body;
    if (!email || !code || !password) {
      return res.status(400).send({ error: "Email, code, and new password are required." });
    }

    const user = await User.findOne({
      email,
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: new Date() }, // code is still valid
    });

    if (!user) return res.status(400).send({ error: "Invalid or expired code." });

    // Update password (will trigger pre-save hook for hashing)
    user.password = password;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.send({ message: "Password has been reset successfully." });
  } catch (error) {
    res.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});


export default usersRouter;
