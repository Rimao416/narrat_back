import mongoose from "mongoose";
import userModel, { IUser } from "./userModel";

// Interface for Admin which extends IUser
export interface IAdmin extends IUser {
  role: "admin";
}

// Mongoose Schema for Admin
const adminModel = new mongoose.Schema<IAdmin>({});

adminModel.set("toObject", { virtuals: true });
adminModel.set("toJSON", { virtuals: true });

adminModel.pre("validate", function (next) {
  if (!this.role) {
    this.role = "admin";
  }
  next();
});

const adminSchema = userModel.discriminator<IAdmin>("Admin", adminModel);

export default adminSchema;
