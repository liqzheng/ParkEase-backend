import mongoose from "mongoose";
import schema from "./schema.js";

const VehicleModel = mongoose.model("VehicleModel", schema);

export default VehicleModel;

