import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "UserModel",
        required: true
    },
    space: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "ParkingSpaceModel",
        required: true
    },
    startTime: { 
        type: Date, 
        required: true
    },
    endTime: { 
        type: Date, 
        required: true
    },
    status: {
        type: String,
        enum: ["PENDING", "CONFIRMED", "CANCELLED"],
        default: "PENDING"
    }
}, {
    timestamps: true  // Automatically add createdAt and updatedAt
});

export default reservationSchema;

