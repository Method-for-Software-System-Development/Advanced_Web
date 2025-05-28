/**
 * Users API routes.
 * Defines all REST endpoints related to user management.
 */

import { Router, Request, Response } from 'express';
import User, { IUser } from '../models/userSchema';

const usersRouter = Router();

/**
 * POST /api/users/login
 * Authenticates a user by email and password.
 * POST /api/users/register
 * Registers a new user. Expects JSON body with user data.
 */
usersRouter.post("/register", async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, phone, password, city, country, postalCode } = req.body;
        const user = new User({
            firstName,
            lastName,
            email,
            phone,
            password,
            city,
            country,
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
 */
usersRouter.post("/login", async (req: Request,res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(401).send({ error: "Invalid email or password" });
        }
        res.status(200).send({ message: "Login successful", user });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).send({ error: error.message });
        } else {
            res.status(500).send({ error: "An unknown error occurred" });
        }
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

export default usersRouter;
