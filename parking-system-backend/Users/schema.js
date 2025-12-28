import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true
    },
    password: { 
        type: String, 
        required: true 
    },
    firstName: { 
        type: String, 
        required: true,
        trim: true
    },
    lastName: { 
        type: String, 
        required: true,
        trim: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: { 
        type: String, 
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ["OWNER", "ADMIN", "GUARD"],
        required: true,
        default: "OWNER"
    },
    plateNumbers: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true  // Automatically add createdAt and updatedAt
});

export default userSchema;

