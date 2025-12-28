import * as dao from "./dao.js";

export default function VehicleRoutes(app) {
    
    // Create vehicle
    const createVehicle = async (req, res) => {
        try {
            // Require authentication
            if (!req.session.user) {
                res.status(401).json({ 
                    message: "Not authenticated" 
                });
                return;
            }
            
            // Owners can only create vehicles for themselves, admins can create for anyone
            const ownerId = req.body.owner || req.session.user._id;
            if (req.session.user.role !== "ADMIN" && ownerId !== req.session.user._id) {
                res.status(403).json({ 
                    message: "Access denied" 
                });
                return;
            }
            
            const vehicle = await dao.createVehicle({
                ...req.body,
                owner: ownerId
            });

            res.json(vehicle);
        } catch (error) {
            res.status(400).json({ 
                message: "Error creating vehicle", 
                error: error.message 
            });
        }
    };

    // Get all vehicles
    const findAllVehicles = async (req, res) => {
        try {
            // Only admins and guards can view all vehicles
            if (!req.session.user || 
                (req.session.user.role !== "ADMIN" && 
                 req.session.user.role !== "GUARD")) {
                res.status(403).json({ 
                    message: "Access denied" 
                });
                return;
            }
            
            const vehicles = await dao.findAllVehicles();
            res.json(vehicles);
        } catch (error) {
            res.status(500).json({ 
                message: "Error fetching vehicles" 
            });
        }
    };

    // Get vehicle by ID
    const findVehicleById = async (req, res) => {
        try {
            const vehicle = await dao.findVehicleById(req.params.vehicleId);
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
                res.json(vehicle);
            } else {
                res.status(403).json({ 
                    message: "Access denied" 
                });
            }
        } catch (error) {
            res.status(500).json({ 
                message: "Error fetching vehicle" 
            });
        }
    };

    // Get vehicle by plate number
    const findVehicleByPlateNumber = async (req, res) => {
        try {
            const plateNumber = req.params.plateNumber;
            const vehicle = await dao.findVehicleByPlateNumber(plateNumber);
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
                res.json(vehicle);
            } else {
                res.status(403).json({ 
                    message: "Access denied" 
                });
            }
        } catch (error) {
            res.status(500).json({ 
                message: "Error fetching vehicle" 
            });
        }
    };

    // Get vehicles by owner
    const findVehiclesByOwner = async (req, res) => {
        try {
            const ownerId = req.params.ownerId || req.session.user?._id;
            
            if (!ownerId) {
                res.status(401).json({ 
                    message: "Not authenticated" 
                });
                return;
            }
            
            // Only admin, guard, or owner themselves can view
            if (req.session.user && 
                (req.session.user.role === "ADMIN" || 
                 req.session.user.role === "GUARD" ||
                 ownerId === req.session.user._id)) {
                const vehicles = await dao.findVehiclesByOwner(ownerId);
                res.json(vehicles);
            } else {
                res.status(403).json({ 
                    message: "Access denied" 
                });
            }
        } catch (error) {
            res.status(500).json({ 
                message: "Error fetching vehicles" 
            });
        }
    };

    // Update vehicle
    const updateVehicle = async (req, res) => {
        try {
            const vehicle = await dao.findVehicleById(req.params.vehicleId);
            if (!vehicle) {
                res.status(404).json({ 
                    message: "Vehicle not found" 
                });
                return;
            }
            
            // Only admin or vehicle owner can update
            if (!req.session.user || 
                (req.session.user.role !== "ADMIN" && 
                 vehicle.owner._id.toString() !== req.session.user._id)) {
                res.status(403).json({ 
                    message: "Access denied" 
                });
                return;
            }
            
            const result = await dao.updateVehicle(req.params.vehicleId, req.body);
            res.json(result);
        } catch (error) {
            res.status(400).json({ 
                message: "Error updating vehicle" 
            });
        }
    };

    // Delete vehicle
    const deleteVehicle = async (req, res) => {
        try {
            const vehicle = await dao.findVehicleById(req.params.vehicleId);
            if (!vehicle) {
                res.status(404).json({ 
                    message: "Vehicle not found" 
                });
                return;
            }
            
            // Only admin or vehicle owner can delete
            if (!req.session.user || 
                (req.session.user.role !== "ADMIN" && 
                 vehicle.owner._id.toString() !== req.session.user._id)) {
                res.status(403).json({ 
                    message: "Access denied" 
                });
                return;
            }
            
            const result = await dao.deleteVehicle(req.params.vehicleId);
            res.json(result);
        } catch (error) {
            res.status(500).json({ 
                message: "Error deleting vehicle" 
            });
        }
    };

    // Register routes
    app.post("/api/vehicles", createVehicle);
    app.get("/api/vehicles", findAllVehicles);
    app.get("/api/vehicles/owner/:ownerId", findVehiclesByOwner);
    app.get("/api/vehicles/plate/:plateNumber", findVehicleByPlateNumber);
    app.get("/api/vehicles/:vehicleId", findVehicleById);
    app.put("/api/vehicles/:vehicleId", updateVehicle);
    app.delete("/api/vehicles/:vehicleId", deleteVehicle);
}

