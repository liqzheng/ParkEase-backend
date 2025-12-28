import ParkingRecordModel from "./model.js";

// CREATE
export const createRecord = (record) => {
    return ParkingRecordModel.create(record);
};

// READ - Various query methods
export const findAllRecords = () => 
    ParkingRecordModel.find()
        .populate("vehicle")
        .populate("space")
        .sort({ checkInTime: -1 });

export const findRecordById = (recordId) => 
    ParkingRecordModel.findById(recordId)
        .populate("vehicle")
        .populate("space");

export const findActiveRecords = () => 
    ParkingRecordModel.find({ status: "ACTIVE" })
        .populate("vehicle")
        .populate("space");

export const findRecordsByVehicle = (vehicleId) => 
    ParkingRecordModel.find({ vehicle: vehicleId })
        .populate("vehicle")
        .populate("space")
        .sort({ checkInTime: -1 });

export const findRecordsBySpace = (spaceId) => 
    ParkingRecordModel.find({ space: spaceId })
        .populate("vehicle")
        .populate("space")
        .sort({ checkInTime: -1 });

export const findActiveRecordBySpace = (spaceId) => 
    ParkingRecordModel.findOne({ 
        space: spaceId, 
        status: "ACTIVE" 
    })
        .populate("vehicle")
        .populate("space");

export const findActiveRecordByVehicle = (vehicleId) => 
    ParkingRecordModel.findOne({ 
        vehicle: vehicleId, 
        status: "ACTIVE" 
    })
        .populate("vehicle")
        .populate("space");

export const findRecordsByStatus = (status) => 
    ParkingRecordModel.find({ status })
        .populate("vehicle")
        .populate("space")
        .sort({ checkInTime: -1 });

export const findRecordsByPaymentStatus = (paymentStatus) => 
    ParkingRecordModel.find({ paymentStatus })
        .populate("vehicle")
        .populate("space")
        .sort({ checkInTime: -1 });

// UPDATE
export const updateRecord = (recordId, record) => 
    ParkingRecordModel.updateOne({ _id: recordId }, { $set: record });

export const updateRecordStatus = (recordId, status) => 
    ParkingRecordModel.updateOne({ _id: recordId }, { $set: { status } });

export const updatePaymentStatus = (recordId, paymentStatus) => 
    ParkingRecordModel.updateOne({ _id: recordId }, { $set: { paymentStatus } });

// DELETE
export const deleteRecord = (recordId) => 
    ParkingRecordModel.deleteOne({ _id: recordId });

