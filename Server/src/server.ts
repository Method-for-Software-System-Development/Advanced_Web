/**
 * Main server file for Express + MongoDB backend (TypeScript version).
 * Initializes the Express application, connects to MongoDB, applies middleware,
 * and sets up API routes for user management.
 */
import dotenv from "dotenv";
dotenv.config();
import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';

import chatbotRouter from './routes/chatbot.route';




import usersRouter from './routes/users.route';
import petRouter from './routes/pet.route';
import treatmentRouter from './routes/treatment.route';
import prescriptionRouter from './routes/prescription.route';
import staffRouter from './routes/staff.route';
import appointmentRouter from './routes/appointment.route';
import statisticsRouter from './routes/statistics.route';

const app: Application = express();
const PORT = 3000;

/**
 * Connect to MongoDB database.
 */
mongoose.connect(process.env.MONGO_URI!)
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

/** Serve static files from uploads directory */
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

/** User routes API */
app.use("/api/users", usersRouter);

/** Pet routes API */
app.use("/api/pets", petRouter);

/** Prescriptions routes API */
app.use("/api/prescriptions", prescriptionRouter);


/** Staff routes API */
app.use("/api/staff", staffRouter);

/** Appointment routes API */
app.use("/api/appointments", appointmentRouter);

/** Statistics routes API */
app.use("/api/statistics", statisticsRouter);

/** Treatment routes API */
app.use("/api/treatments", treatmentRouter);

/** Chatbot API Route */
app.use("/api/chatbot", chatbotRouter);
console.log(">> Chatbot route registered");

/** Simple health check route */
app.get("/", (req: Request, res: Response) => {
    res.send("Server is running!");
});

/** Start listening for incoming HTTP requests */
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
