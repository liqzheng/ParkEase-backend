import * as dao from "./dao.js";

export default function ParkingSpaceRoutes(app) {
    
    // Create parking space
    const createSpace = async (req, res) => {
        try {
            // Only admins can create parking spaces
            if (!req.session.user || req.session.user.role !== "ADMIN") {
                res.status(403).json({ 
                    message: "Access denied. Admin only." 
                });
                return;
            }
            
            const space = await dao.createSpace(req.body);
            res.json(space);
        } catch (error) {
            res.status(400).json({ 
                message: "Error creating space", 
                error: error.message 
            });
        }
    };

    // Get all parking spaces
    const findAllSpaces = async (req, res) => {
        try {
            const spaces = await dao.findAllSpaces();
            res.json(spaces);
        } catch (error) {
            res.status(500).json({ 
                message: "Error fetching spaces" 
            });
        }
    };

    // Get available parking spaces
    const findAvailableSpaces = async (req, res) => {
        try {
            const spaces = await dao.findAvailableSpaces();
            res.json(spaces);
        } catch (error) {
            res.status(500).json({ 
                message: "Error fetching available spaces" 
            });
        }
    };

    // Get by ID
    const findSpaceById = async (req, res) => {
        try {
            const space = await dao.findSpaceById(req.params.spaceId);
            if (!space) {
                res.status(404).json({ 
                    message: "Space not found" 
                });
                return;
            }
            res.json(space);
        } catch (error) {
            res.status(500).json({ 
                message: "Error fetching space" 
            });
        }
    };

    // Get by floor
    const findSpacesByFloor = async (req, res) => {
        try {
            const floor = parseInt(req.params.floor);
            const spaces = await dao.findSpacesByFloor(floor);
            res.json(spaces);
        } catch (error) {
            res.status(500).json({ 
                message: "Error fetching spaces by floor" 
            });
        }
    };

    // Get by zone
    const findSpacesByZone = async (req, res) => {
        try {
            const zone = req.params.zone.toUpperCase();
            const spaces = await dao.findSpacesByZone(zone);
            res.json(spaces);
        } catch (error) {
            res.status(500).json({ 
                message: "Error fetching spaces by zone" 
            });
        }
    };

    // Get by type
    const findSpacesByType = async (req, res) => {
        try {
            const type = req.params.type.toUpperCase();
            const spaces = await dao.findSpacesByType(type);
            res.json(spaces);
        } catch (error) {
            res.status(500).json({ 
                message: "Error fetching spaces by type" 
            });
        }
    };

    // Update parking space
    const updateSpace = async (req, res) => {
        try {
            // Only admins can update parking spaces
            if (!req.session.user || req.session.user.role !== "ADMIN") {
                res.status(403).json({ 
                    message: "Access denied. Admin only." 
                });
                return;
            }
            
            const result = await dao.updateSpace(
                req.params.spaceId, 
                req.body
            );
            res.json(result);
        } catch (error) {
            res.status(400).json({ 
                message: "Error updating space" 
            });
        }
    };

    // Update parking space status
    const updateSpaceStatus = async (req, res) => {
        try {
            // Admins and guards can update status
            if (!req.session.user || 
                (req.session.user.role !== "ADMIN" && 
                 req.session.user.role !== "GUARD")) {
                res.status(403).json({ 
                    message: "Access denied" 
                });
                return;
            }
            
            const { status } = req.body;
            const result = await dao.updateSpaceStatus(
                req.params.spaceId, 
                status
            );
            res.json(result);
            
        } catch (error) {
            res.status(400).json({ 
                message: "Error updating space status" 
            });
        }
    };

    // Delete parking space
    const deleteSpace = async (req, res) => {
        try {
            // Only admins can delete parking spaces
            if (!req.session.user || req.session.user.role !== "ADMIN") {
                res.status(403).json({ 
                    message: "Access denied. Admin only." 
                });
                return;
            }
            
            const result = await dao.deleteSpace(req.params.spaceId);
            res.json(result);
        } catch (error) {
            res.status(500).json({ 
                message: "Error deleting space" 
            });
        }
    };

    // Register routes
    app.post("/api/parking-spaces", createSpace);
    app.get("/api/parking-spaces", findAllSpaces);
    app.get("/api/parking-spaces/available", findAvailableSpaces);
    app.get("/api/parking-spaces/floor/:floor", findSpacesByFloor);
    app.get("/api/parking-spaces/zone/:zone", findSpacesByZone);
    app.get("/api/parking-spaces/type/:type", findSpacesByType);
    app.get("/api/parking-spaces/:spaceId", findSpaceById);
    app.put("/api/parking-spaces/:spaceId", updateSpace);
    app.put("/api/parking-spaces/:spaceId/status", updateSpaceStatus);
    app.delete("/api/parking-spaces/:spaceId", deleteSpace);
}

