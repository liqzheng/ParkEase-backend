import mongoose from "mongoose";
import schema from "./schema.js";

const ReservationModel = mongoose.model("ReservationModel", schema);

export default ReservationModel;

