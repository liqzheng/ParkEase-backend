import * as dao from "./dao.js";

export default function UserRoutes(app) {
    
    // User registration
    const signup = async (req, res) => {

        try {
            const { username, password, firstName, lastName, email, phone, role, plateNumbers } = req.body;
            
            // Check if username already exists
            const existingUser = await dao.findUserByUsername(username);
            if (existingUser) {
                res.status(400).json({ 
                    message: "Username already exists" 
                });
                return;
            }
            
            // Check if email already exists
            const existingEmail = await dao.findUserByEmail(email);
            if (existingEmail) {
                res.status(400).json({ 
                    message: "Email already exists" 
                });
                return;
            }
            
            const user = await dao.createUser({
                username,
                password,
                firstName,
                lastName,
                email,
                phone,
                role: role || "OWNER",
                plateNumbers: plateNumbers || []
            });
            
            const userResponse = user.toObject();
            delete userResponse.password;
            
            res.json(userResponse);
        } catch (error) {
            res.status(400).json({ 
                message: "Error creating user", 
                error: error.message 
            });
        }
    };

    // User login
    const signin = async (req, res) => {
        try {
            const { username, password } = req.body;
            
            const user = await dao.findUserByUsername(username);
            if (!user) {
                res.status(401).json({ 
                    message: "Invalid username or password" 
                });
                return;
            }
            
            const isValidPassword = await dao.verifyPassword(password, user.password);
            if (!isValidPassword) {
                res.status(401).json({ 
                    message: "Invalid username or password" 
                });
                return;
            }
            
            // Store user info in session
            req.session.user = {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            };
            
            const userResponse = user.toObject();
            delete userResponse.password;
            
            res.json(userResponse);
        } catch (error) {
            res.status(500).json({ 
                message: "Error during signin", 
                error: error.message 
            });
        }
    };

    // User logout
    const signout = async (req, res) => {
        try {
            req.session.destroy();
            res.json({ message: "Signed out successfully" });
        } catch (error) {
            res.status(500).json({ 
                message: "Error during signout" 
            });
        }
    };

    // Get current user info
    const profile = async (req, res) => {
        try {
            if (!req.session.user) {
                res.status(401).json({ 
                    message: "Not authenticated" 
                });
                return;
            }
            
            const user = await dao.findUserById(req.session.user._id);

            if (!user) {
                res.status(404).json({ 
                    message: "User not found" 
                });
                return;
            }
            
            const userResponse = user.toObject();
            delete userResponse.password;
            
            res.json(userResponse);

        } catch (error) {
            res.status(500).json({ 
                message: "Error fetching profile" 
            });
        }
    };

    // Get all users
    const findAllUsers = async (req, res) => {
        try {
            // Check if admin
            if (!req.session.user || req.session.user.role !== "ADMIN") {
                res.status(403).json({ 
                    message: "Access denied. Admin only." 
                });
                return;
            }
            
            const users = await dao.findAllUsers();
            // Remove passwords from all users
            const usersResponse = users.map(user => {
                const userObj = user.toObject();
                delete userObj.password;
                return userObj;
            });
            res.json(usersResponse);
        } catch (error) {
            res.status(500).json({ 
                message: "Error fetching users" 
            });
        }
    };

    // Get user by ID
    const findUserById = async (req, res) => {
        try {
            const user = await dao.findUserById(req.params.userId);
            if (!user) {
                res.status(404).json({ 
                    message: "User not found" 
                });
                return;
            }
            
            // Only admin or user themselves can view
            if (req.session.user && 
                (req.session.user.role === "ADMIN" || 
                 req.session.user._id === user._id.toString())) {
                const userResponse = user.toObject();
                delete userResponse.password;
                res.json(userResponse);
            } else {
                res.status(403).json({ 
                    message: "Access denied" 
                });
            }
        } catch (error) {
            res.status(500).json({ 
                message: "Error fetching user" 
            });
        }
    };

    // Update user
    const updateUser = async (req, res) => {

        try {
            const userId = req.params.userId;

            const user = await dao.findUserById(userId);

            
            if (!user) {
                res.status(404).json({ 
                    message: "User not found" 
                });
                return;
            }
            
            // Only admin or user themselves can update
            if (!req.session.user || 
                (req.session.user.role !== "ADMIN" && 
                 req.session.user._id !== userId)) {
                res.status(403).json({ 
                    message: "Access denied" 
                });

                return;
            }
            
            // Don't allow updating password and role through this endpoint
            const { password, role, ...updateData } = req.body;
            
            const result = await dao.updateUser(userId, updateData);
            res.json(result);
        } catch (error) {
            res.status(400).json({ 
                message: "Error updating user" 
            });
        }
    };

    // Delete user
    const deleteUser = async (req, res) => {
        try {
            // Only admin can delete users
            if (!req.session.user || req.session.user.role !== "ADMIN") {
                res.status(403).json({ 
                    message: "Access denied. Admin only." 
                });
                return;
            }
            
            const result = await dao.deleteUser(req.params.userId);
            res.json(result);
        } catch (error) {
            res.status(500).json({ 
                message: "Error deleting user" 
            });
        }
    };

    // Add plate number
    const addPlateNumber = async (req, res) => {
        try {
            const userId = req.params.userId;
            
            // Only user themselves can add plate numbers
            if (!req.session.user || req.session.user._id !== userId) {
                res.status(403).json({ 
                    message: "Access denied" 
                });
                return;
            }
            
            const { plateNumber } = req.body;
            if (!plateNumber) {
                res.status(400).json({ 
                    message: "Plate number is required" 
                });
                return;
            }
            
            const result = await dao.addPlateNumber(userId, plateNumber);
            res.json(result);
        } catch (error) {
            res.status(400).json({ 
                message: "Error adding plate number" 
            });
        }
    };

    // Register routes
    app.post("/api/users/signup", signup);
    app.post("/api/users/signin", signin);
    app.post("/api/users/signout", signout);
    app.get("/api/users/profile", profile);
    app.get("/api/users", findAllUsers);
    app.get("/api/users/:userId", findUserById);
    app.put("/api/users/:userId", updateUser);
    app.delete("/api/users/:userId", deleteUser);
    app.post("/api/users/:userId/plate-numbers", addPlateNumber);
}

