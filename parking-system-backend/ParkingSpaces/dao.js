import ParkingSpaceModel from "./model.js";

// CREATE
export const createSpace = (space) => {
    return ParkingSpaceModel.create(space);
};

// READ 
export const findAllSpaces = () => ParkingSpaceModel.find();

export const findSpaceById = (spaceId) => ParkingSpaceModel.findById(spaceId);

export const findSpaceByNumber = (spaceNumber) => 
    ParkingSpaceModel.findOne({ spaceNumber });

export const findAvailableSpaces = () => 
    ParkingSpaceModel.find({ status: "AVAILABLE" });

export const findSpacesByFloor = (floor) => 
    ParkingSpaceModel.find({ floor });

export const findSpacesByZone = (zone) => 
    ParkingSpaceModel.find({ zone });

export const findSpacesByType = (type) => 
    ParkingSpaceModel.find({ type });

export const findSpacesByStatus = (status) => 
    ParkingSpaceModel.find({ status });

export const findSpacesBySize = (size) => 
    ParkingSpaceModel.find({ size });

// UPDATE
export const updateSpace = (spaceId, space) => 
    ParkingSpaceModel.updateOne({ _id: spaceId }, { $set: space });

export const updateSpaceStatus = (spaceId, status) => 
    ParkingSpaceModel.updateOne({ _id: spaceId }, { $set: { status } });

// DELETE
export const deleteSpace = (spaceId) => 
    ParkingSpaceModel.deleteOne({ _id: spaceId });

