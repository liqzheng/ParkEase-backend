import mongoose from "mongoose";
import schema from "./schema.js";

const ParkingSpaceModel = mongoose.model("ParkingSpaceModel", schema);

export default ParkingSpaceModel;

