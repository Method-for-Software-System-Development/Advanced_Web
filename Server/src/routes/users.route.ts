/**
 * Users API routes.
 * Defines all REST endpoints related to user management.
 */

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
          id: user._id,
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
 * POST /api/users/login
 * Authenticates a user by email and password.
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

export default usersRouter;
