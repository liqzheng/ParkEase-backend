import mongoose from "mongoose";

const parkingSpaceSchema = new mongoose.Schema({
    spaceNumber: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true
    },
    floor: { 
        type: Number, 
        required: true 
    },
    zone: { 
        type: String, 
        enum: ["A", "B", "C", "D"],
        required: true 
    },
    type: {
        type: String,
        enum: ["REGULAR", "VIP", "DISABLED"],
        default: "REGULAR"
    },
    status: {
        type: String,
        enum: ["AVAILABLE", "OCCUPIED", "RESERVED"],
        default: "AVAILABLE"
    },
    size: {
        type: String,
        enum: ["SMALL", "MEDIUM", "LARGE"],
        default: "MEDIUM"
    }
}, {
    timestamps: true  // Automatically add createdAt and updatedAt
});

export default parkingSpaceSchema;

