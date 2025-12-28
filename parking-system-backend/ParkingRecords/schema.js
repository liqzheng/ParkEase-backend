import mongoose from "mongoose";

const parkingRecordSchema = new mongoose.Schema({
    vehicle: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "VehicleModel",
        required: true
    },
    space: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "ParkingSpaceModel",
        required: true
    },
    checkInTime: { 
        type: Date, 
        required: true,
        default: Date.now
    },
    checkOutTime: { 
        type: Date
    },
    fee: { 
        type: Number, 
        default: 0
    },
    status: {
        type: String,
        enum: ["ACTIVE", "COMPLETED"],
        default: "ACTIVE"
    },
    paymentStatus: {
        type: String,
        enum: ["PENDING", "PAID"],
        default: "PENDING"
    }
}, {
    timestamps: true  // Automatically add createdAt and updatedAt
});

export default parkingRecordSchema;

