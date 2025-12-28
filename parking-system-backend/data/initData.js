import mongoose from "mongoose";
import dotenv from "dotenv";
import UserModel from "../Users/model.js";
import ParkingSpaceModel from "../ParkingSpaces/model.js";
import VehicleModel from "../Vehicles/model.js";
import * as userDao from "../Users/dao.js";

// Load environment variables
dotenv.config();

const initData = async () => {
    try {
        // Connect to database
        const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/parking-system";
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB");

        // Clear existing data
        console.log("Clearing existing data...");
        await UserModel.deleteMany({});
        await ParkingSpaceModel.deleteMany({});
        await VehicleModel.deleteMany({});

        // Create test users
        console.log("Creating test users...");
        const users = [
            {
                username: "admin",
                password: "admin123",
                firstName: "System",
                lastName: "Administrator",
                email: "admin@parking.com",
                phone: "13800138000",
                role: "ADMIN"
            },
            {
                username: "guard1",
                password: "guard123",
                firstName: "John",
                lastName: "Smith",
                email: "guard1@parking.com",
                phone: "13800138001",
                role: "GUARD"
            },
            {
                username: "guard2",
                password: "guard123",
                firstName: "Mike",
                lastName: "Johnson",
                email: "guard2@parking.com",
                phone: "13800138002",
                role: "GUARD"
            },
            {
                username: "owner1",
                password: "owner123",
                firstName: "Alice",
                lastName: "Williams",
                email: "owner1@parking.com",
                phone: "13800138003",
                role: "OWNER",
                plateNumbers: ["ABC123", "XYZ789"]
            },
            {
                username: "owner2",
                password: "owner123",
                firstName: "Bob",
                lastName: "Brown",
                email: "owner2@parking.com",
                phone: "13800138004",
                role: "OWNER",
                plateNumbers: ["DEF456"]
            },
            {
                username: "owner3",
                password: "owner123",
                firstName: "Carol",
                lastName: "Davis",
                email: "owner3@parking.com",
                phone: "13800138005",
                role: "OWNER",
                plateNumbers: ["GHI789", "JKL012"]
            }
        ];

        const createdUsers = [];
        for (const userData of users) {
            const user = await userDao.createUser(userData);
            createdUsers.push(user);
            console.log(`Created user: ${user.username}`);
        }

        // Create parking spaces (3 floors, 20 spaces per floor)
        console.log("Creating parking spaces...");
        const spaces = [];
        for (let floor = 1; floor <= 3; floor++) {
            for (let num = 1; num <= 20; num++) {
                const spaceNumber = `${floor}F-${String(num).padStart(2, '0')}`;
                const zone = ['A', 'B', 'C', 'D'][Math.floor((num - 1) / 5)];
                
                let type = "REGULAR";
                if (num <= 2) {
                    type = "VIP";
                } else if (num === 20) {
                    type = "DISABLED";
                }
                
                let size = "MEDIUM";
                if (num % 3 === 0) {
                    size = "LARGE";
                } else if (num % 2 === 0) {
                    size = "MEDIUM";
                } else {
                    size = "SMALL";
                }
                
                spaces.push({
                    spaceNumber,
                    floor,
                    zone,
                    type,
                    status: "AVAILABLE",
                    size
                });
            }
        }

        await ParkingSpaceModel.insertMany(spaces);
        console.log(`Created ${spaces.length} parking spaces`);

        // Create test vehicles
        console.log("Creating test vehicles...");
        const vehicles = [
            {
                plateNumber: "ABC123",
                owner: createdUsers.find(u => u.username === "owner1")._id,
                make: "Toyota",
                model: "Camry",
                color: "White",
                type: "CAR"
            },
            {
                plateNumber: "XYZ789",
                owner: createdUsers.find(u => u.username === "owner1")._id,
                make: "BMW",
                model: "X5",
                color: "Black",
                type: "CAR"
            },
            {
                plateNumber: "DEF456",
                owner: createdUsers.find(u => u.username === "owner2")._id,
                make: "Honda",
                model: "Civic",
                color: "Red",
                type: "CAR"
            },
            {
                plateNumber: "GHI789",
                owner: createdUsers.find(u => u.username === "owner3")._id,
                make: "Mercedes",
                model: "C-Class",
                color: "Silver",
                type: "CAR"
            },
            {
                plateNumber: "JKL012",
                owner: createdUsers.find(u => u.username === "owner3")._id,
                make: "Yamaha",
                model: "MT-07",
                color: "Blue",
                type: "MOTORCYCLE"
            }
        ];

        await VehicleModel.insertMany(vehicles);
        console.log(`Created ${vehicles.length} vehicles`);

        console.log("\n✅ Initial data created successfully!");
        console.log("\nTest accounts:");
        console.log("Admin: username=admin, password=admin123");
        console.log("Guard: username=guard1, password=guard123");
        console.log("Owner: username=owner1, password=owner123");
        
        mongoose.disconnect();
        console.log("\nDisconnected from MongoDB");
    } catch (error) {
        console.error("Error initializing data:", error);
        mongoose.disconnect();
        process.exit(1);
    }
};

initData();
