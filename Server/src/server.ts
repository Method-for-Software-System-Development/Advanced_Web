/**
 * Main server file for Express + MongoDB backend (TypeScript version).
 * Initializes the Express application, connects to MongoDB, applies middleware,
 * and sets up API routes for user management.
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';

import usersRouter from './routes/users.route';
import petRouter from './routes/pet.route';
import treatmentRouter from './routes/treatment.route';
import prescriptionRouter from './routes/prescription.route';

const app: Application = express();
const PORT = 3000;

/**
 * Connect to MongoDB database.
 */
mongoose.connect('mongodb+srv://matantal606:GqDLkYkM59dcDvig@petclinic.zj4wsof.mongodb.net/FurEverFriends?retryWrites=true&w=majority&appName=petclinic')
    .then(() => console.log('Connected to MongoDB!'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

/** Middlewares for JSON parsing and CORS support */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use((req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Headers", "Origin,X-Requested-With, Content-Type, Accept");
    next();
});

/** User routes API */
app.use("/api/users", usersRouter);

/** Pet routes API */
app.use("/api/pets", petRouter);

/** Prescriptions routes API */
app.use("/api/prescriptions", prescriptionRouter);

/** Simple health check route */
app.get("/", (req: Request, res: Response) => {
    res.send("Server is running!");
});

/** Start listening for incoming HTTP requests */
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
