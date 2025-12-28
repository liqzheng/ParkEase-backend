import mongoose from "mongoose";
import schema from "./schema.js";

const ParkingRecordModel = mongoose.model("ParkingRecordModel", schema);

export default ParkingRecordModel;

