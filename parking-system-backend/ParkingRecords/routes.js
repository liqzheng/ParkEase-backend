import * as dao from "./dao.js";
import * as spaceDao from "../ParkingSpaces/dao.js";
import * as vehicleDao from "../Vehicles/dao.js";
import { calculateFee } from "../utils/feeCalculator.js";

export default function ParkingRecordRoutes(app) {
    
    // Vehicle check-in
    const checkIn = async (req, res) => {
        try {
            // Only admins and guards can process check-in
            if (!req.session.user || 
                (req.session.user.role !== "ADMIN" && 
                 req.session.user.role !== "GUARD")) {
                res.status(403).json({ 
                    message: "Access denied. Admin or Guard only." 
                });
                return;
            }
            
            const { vehicleId, spaceId } = req.body;
            
            // Check if vehicle exists
            const vehicle = await vehicleDao.findVehicleById(vehicleId);
            if (!vehicle) {
                res.status(404).json({ 
                    message: "Vehicle not found" 
                });
                return;
            }
            
            // Check if parking space exists
            const space = await spaceDao.findSpaceById(spaceId);
            if (!space) {
                res.status(404).json({ 
                    message: "Parking space not found" 
                });
                return;
            }
            
            // Check if parking space is available
            if (space.status !== "AVAILABLE") {
                res.status(400).json({ 
                    message: `Parking space is ${space.status.toLowerCase()}` 
                });
                return;
            }

            
            // Check if vehicle already has an active parking record
            const activeRecord = await dao.findActiveRecordByVehicle(vehicleId);
            if (activeRecord) {
                res.status(400).json({ 
                    message: "Vehicle already has an active parking record" 
                });
                return;
            }
            
            // Create parking record
            const record = await dao.createRecord({
                vehicle: vehicleId,
                space: spaceId,
                checkInTime: new Date(),
                status: "ACTIVE",
                paymentStatus: "PENDING"
            });
            
            // Update parking space status to OCCUPIED
            await spaceDao.updateSpaceStatus(spaceId, "OCCUPIED");
            
            const populatedRecord = await dao.findRecordById(record._id);
            res.json(populatedRecord);
        } catch (error) {
            res.status(400).json({ 
                message: "Error during check-in", 
                error: error.message 
            });
        }
    };

    // Vehicle check-out
    const checkOut = async (req, res) => {
        try {
            // Only admins and guards can process check-out
            if (!req.session.user || 
                (req.session.user.role !== "ADMIN" && 
                 req.session.user.role !== "GUARD")) {
                res.status(403).json({ 
                    message: "Access denied. Admin or Guard only." 
                });
                return;
            }
            
            const { recordId } = req.body;
            
            // Find parking record
            const record = await dao.findRecordById(recordId);

            if (!record) {
                res.status(404).json({ 
                    message: "Parking record not found" 
                });
                return;
            }
            
            if (record.status !== "ACTIVE") {
                res.status(400).json({ 
                    message: "Record is not active" 
                });
                return;
            }
            
            // Calculate fee
            const checkOutTime = new Date();
            const fee = calculateFee(
                record.checkInTime,
                checkOutTime,
                record.space.type
            );
            
            // Update record
            await dao.updateRecord(recordId, {
                checkOutTime,
                fee,
                status: "COMPLETED"
            });
            
            // Update parking space status to AVAILABLE
            await spaceDao.updateSpaceStatus(record.space._id, "AVAILABLE");
            const updatedRecord = await dao.findRecordById(recordId);
            res.json(updatedRecord);
        } catch (error) {
            res.status(400).json({ 
                message: "Error during check-out", 
                error: error.message 
            });
        }
    };

    // Pay parking fee
    const payFee = async (req, res) => {
        try {
            const { recordId } = req.body;
            
            const record = await dao.findRecordById(recordId);
            if (!record) {
                res.status(404).json({ 
                    message: "Parking record not found" 
                });
                return;
            }
            
            // Only vehicle owner, admin, or guard can pay
            if (!req.session.user) {
                res.status(401).json({ 
                    message: "Not authenticated" 
                });
                return;
            }
            
            const isOwner = record.vehicle.owner._id.toString() === req.session.user._id;
            const isAdminOrGuard = req.session.user.role === "ADMIN" || 
                                   req.session.user.role === "GUARD";
            
            if (!isOwner && !isAdminOrGuard) {
                res.status(403).json({ 
                    message: "Access denied" 
                });
                return;
            }
            
            await dao.updatePaymentStatus(recordId, "PAID");
            const updatedRecord = await dao.findRecordById(recordId);
            res.json(updatedRecord);
        } catch (error) {
            res.status(400).json({ 
                message: "Error processing payment" 
            });
        }
    };

    // Get all parking records
    const findAllRecords = async (req, res) => {
        try {
            // Only admins and guards can view all records
            if (!req.session.user || 
                (req.session.user.role !== "ADMIN" && 
                 req.session.user.role !== "GUARD")) {
                res.status(403).json({ 
                    message: "Access denied" 
                });
                return;
            }
            
            const records = await dao.findAllRecords();
            res.json(records);
        } catch (error) {
            res.status(500).json({ 
                message: "Error fetching records" 
            });
        }
    };

    // Get active parking records
    const findActiveRecords = async (req, res) => {
        try {
            // Only admins and guards can view
            if (!req.session.user || 
                (req.session.user.role !== "ADMIN" && 
                 req.session.user.role !== "GUARD")) {
                res.status(403).json({ 
                    message: "Access denied" 
                });
                return;
            }
            
            const records = await dao.findActiveRecords();
            res.json(records);
        } catch (error) {
            res.status(500).json({ 
                message: "Error fetching active records" 
            });
        }
    };

    // Get record by ID
    const findRecordById = async (req, res) => {
        try {
            const record = await dao.findRecordById(req.params.recordId);
            if (!record) {
                res.status(404).json({ 
                    message: "Record not found" 
                });
                return;
            }
            
            // Only admin, guard, or vehicle owner can view
            if (req.session.user && 
                (req.session.user.role === "ADMIN" || 
                 req.session.user.role === "GUARD" ||
                 record.vehicle.owner._id.toString() === req.session.user._id)) {
                res.json(record);
                
            } else {
                res.status(403).json({ 
                    message: "Access denied" 
                });
            }
        } catch (error) {
            res.status(500).json({ 
                message: "Error fetching record" 
            });
        }
    };

    // Get records by vehicle
    const findRecordsByVehicle = async (req, res) => {
        try {
            const vehicleId = req.params.vehicleId;
            const vehicle = await vehicleDao.findVehicleById(vehicleId);
            
            if (!vehicle) {
                res.status(404).json({ 
                    message: "Vehicle not found" 
                });
                return;
            }
            
            // Only admin, guard, or vehicle owner can view
            if (req.session.user && 
                (req.session.user.role === "ADMIN" || 
                 req.session.user.role === "GUARD" ||
                 vehicle.owner._id.toString() === req.session.user._id)) {
                const records = await dao.findRecordsByVehicle(vehicleId);
                res.json(records);
            } else {
                res.status(403).json({ 
                    message: "Access denied" 
                });
            }
        } catch (error) {
            res.status(500).json({ 
                message: "Error fetching records" 
            });
        }
    };

    // Register routes
    app.post("/api/parking-records/check-in", checkIn);
    app.post("/api/parking-records/check-out", checkOut);
    app.post("/api/parking-records/pay", payFee);
    app.get("/api/parking-records", findAllRecords);
    app.get("/api/parking-records/active", findActiveRecords);
    app.get("/api/parking-records/vehicle/:vehicleId", findRecordsByVehicle);
    app.get("/api/parking-records/:recordId", findRecordById);
}

