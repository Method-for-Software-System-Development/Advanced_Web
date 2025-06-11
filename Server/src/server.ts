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
import medicineRouter from './routes/medicine.route';
import staffRouter from './routes/staff.route';
import appointmentRouter from './routes/appointment.route';
import statisticsRouter from './routes/statistics.route';

const app: Application = express();
const PORT = process.env.PORT || 3000;

/**
 * Connect to MongoDB database.
 */
mongoose.connect(process.env.MONGODB_URI!)
    .then(() => console.log('Connected to MongoDB!'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

/** Middlewares for JSON parsing and CORS support */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Enhanced CORS middleware configuration
const corsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // List of allowed origins
        const allowedOrigins = [
            'https://client-tal-yagudins-projects.vercel.app',
            'http://localhost:5173',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000'
        ];
        
        // Add CORS_ORIGIN from environment if set
        if (process.env.CORS_ORIGIN) {
            allowedOrigins.push(process.env.CORS_ORIGIN);
        }
        
        // Check if origin is allowed
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all for now to debug
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'Accept', 
        'Origin', 
        'X-Requested-With',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Additional CORS middleware for manual control
app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    
    // Set CORS headers explicitly
    if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        res.header('Access-Control-Allow-Origin', '*');
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    
    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    next();
});

/** Serve static files from uploads directory */
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads', express.static(path.join(__dirname, '../UserUploads')));

/** User routes API */
app.use("/api/users", usersRouter);

/** Pet routes API */
app.use("/api/pets", petRouter);

/** Prescriptions routes API */
app.use("/api/prescriptions", prescriptionRouter);

/** Medicine routes API */
app.use("/api/medicines", medicineRouter);


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

/** Simple health check route */
app.get("/", (req: Request, res: Response) => {
    res.send("Server is running!");
});

/** CORS debugging endpoint */
app.get("/api/cors-test", (req: Request, res: Response) => {
    const origin = req.headers.origin;
    res.json({
        message: "CORS test successful",
        origin: origin || "no origin header",
        timestamp: new Date().toISOString(),
        headers: req.headers
    });
});

/** Start listening for incoming HTTP requests (only in development) */
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Export the Express app for Vercel
export default app;
