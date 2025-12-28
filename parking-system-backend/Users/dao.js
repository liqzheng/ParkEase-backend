import UserModel from "./model.js";
import bcrypt from "bcrypt";

// CREATE
export const createUser = async (user) => {
    // Hash password if it exists
    if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
    }
    return UserModel.create(user);
};

// READ - Various query methods
export const findAllUsers = () => UserModel.find();

export const findUserById = (userId) => UserModel.findById(userId);

export const findUserByUsername = (username) => 
    UserModel.findOne({ username });

export const findUserByEmail = (email) => 
    UserModel.findOne({ email });

export const findUsersByRole = (role) => 
    UserModel.find({ role });

export const findUserByPlateNumber = (plateNumber) =>
    UserModel.findOne({ plateNumbers: plateNumber });

// UPDATE
export const updateUser = (userId, user) => 
    UserModel.updateOne({ _id: userId }, { $set: user });

export const updateUserPassword = async (userId, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return UserModel.updateOne({ _id: userId }, { $set: { password: hashedPassword } });
};

export const addPlateNumber = (userId, plateNumber) =>
    UserModel.updateOne(
        { _id: userId },
        { $addToSet: { plateNumbers: plateNumber } }
    );

export const removePlateNumber = (userId, plateNumber) =>
    UserModel.updateOne(
        { _id: userId },
        { $pull: { plateNumbers: plateNumber } }
    );

// DELETE
export const deleteUser = (userId) => 
    UserModel.deleteOne({ _id: userId });

// Verify password
export const verifyPassword = async (plainPassword, hashedPassword) => {
    return bcrypt.compare(plainPassword, hashedPassword);
};

