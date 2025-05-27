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
            postalCode
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
*/
export default usersRouter;
