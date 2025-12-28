import mongoose from "mongoose";
import schema from "./schema.js";

const UserModel = mongoose.model("UserModel", schema);

export default UserModel;

