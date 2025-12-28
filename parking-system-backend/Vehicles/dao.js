import VehicleModel from "./model.js";

// CREATE
export const createVehicle = (vehicle) => {
    return VehicleModel.create(vehicle);
};

// READ - Various query methods
export const findAllVehicles = () => VehicleModel.find().populate("owner");

export const findVehicleById = (vehicleId) => 
    VehicleModel.findById(vehicleId).populate("owner");

export const findVehicleByPlateNumber = (plateNumber) => 
    VehicleModel.findOne({ plateNumber: plateNumber.toUpperCase() }).populate("owner");

export const findVehiclesByOwner = (ownerId) => 
    VehicleModel.find({ owner: ownerId }).populate("owner");

export const findVehiclesByType = (type) => 
    VehicleModel.find({ type }).populate("owner");

// UPDATE
export const updateVehicle = (vehicleId, vehicle) => 
    VehicleModel.updateOne({ _id: vehicleId }, { $set: vehicle });

// DELETE
export const deleteVehicle = (vehicleId) => 
    VehicleModel.deleteOne({ _id: vehicleId });

