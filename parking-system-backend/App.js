import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';

// Import all routes
import UserRoutes from './Users/routes.js';
import ParkingSpaceRoutes from './ParkingSpaces/routes.js';
import VehicleRoutes from './Vehicles/routes.js';
import ParkingRecordRoutes from './ParkingRecords/routes.js';
import ReservationRoutes from './Reservations/routes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/parking-system"
);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Create Express app
const app = express();


// Configure CORS
app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_URL || "http://localhost:3000"
}));


// Configure Session
app.use(session({
    secret: process.env.SESSION_SECRET || "parking-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to false for development, true for production with HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));


// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register all routes
UserRoutes(app);
ParkingSpaceRoutes(app);
VehicleRoutes(app);
ParkingRecordRoutes(app);
ReservationRoutes(app);

// Health check endpoint
app.get("/", (req, res) => {
    res.json({ message: "Parking System API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: "Internal server error", 
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

