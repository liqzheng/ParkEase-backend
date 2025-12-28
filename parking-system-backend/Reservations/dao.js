import ReservationModel from "./model.js";

// CREATE
export const createReservation = (reservation) => {
    return ReservationModel.create(reservation);
};

// READ - Various query methods
export const findAllReservations = () => 
    ReservationModel.find()
        .populate("user")
        .populate("space")
        .sort({ startTime: -1 });

export const findReservationById = (reservationId) => 
    ReservationModel.findById(reservationId)
        .populate("user")
        .populate("space");

export const findReservationsByUser = (userId) => 
    ReservationModel.find({ user: userId })
        .populate("user")
        .populate("space")
        .sort({ startTime: -1 });

export const findReservationsBySpace = (spaceId) => 
    ReservationModel.find({ space: spaceId })
        .populate("user")
        .populate("space")
        .sort({ startTime: -1 });

export const findReservationsByStatus = (status) => 
    ReservationModel.find({ status })
        .populate("user")
        .populate("space")
        .sort({ startTime: -1 });

// Find conflicting reservations within specified time range
export const findConflictingReservations = (spaceId, startTime, endTime) => {
    return ReservationModel.find({
        space: spaceId,
        status: { $in: ["PENDING", "CONFIRMED"] },
        $or: [
            {
                startTime: { $lte: startTime },
                endTime: { $gt: startTime }
            },
            {
                startTime: { $lt: endTime },
                endTime: { $gte: endTime }
            },
            {
                startTime: { $gte: startTime },
                endTime: { $lte: endTime }
            }
        ]
    });
};

// UPDATE
export const updateReservation = (reservationId, reservation) => 
    ReservationModel.updateOne({ _id: reservationId }, { $set: reservation });

export const updateReservationStatus = (reservationId, status) => 
    ReservationModel.updateOne({ _id: reservationId }, { $set: { status } });

// DELETE
export const deleteReservation = (reservationId) => 
    ReservationModel.deleteOne({ _id: reservationId });

