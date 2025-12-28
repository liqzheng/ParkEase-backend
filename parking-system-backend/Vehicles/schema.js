import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
    plateNumber: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        uppercase: true
    },
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "UserModel",
        required: true
    },
    make: { 
        type: String, 
        required: true,
        trim: true
    },
    model: { 
        type: String, 
        required: true,
        trim: true
    },
    color: { 
        type: String, 
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ["CAR", "MOTORCYCLE", "TRUCK"],
        default: "CAR"
    }
}, {
    timestamps: true  // Automatically add createdAt and updatedAt
});

export default vehicleSchema;

