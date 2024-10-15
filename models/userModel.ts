import mongoose from "mongoose";
import bcrypt from "bcrypt";

export interface IUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: string;
  status: string;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
  otp?: string;
  otpExpires?: Date;
}
const userSchema = new mongoose.Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "Veuillez renseigner le nom complet"],
      trim: true,
      maxlength: [50, "Le nom complet doit avoir moins de 50 caractères"],
      minlength: [3, "Le nom complet doit avoir au moins 3 caractères"],
      lowercase: true,
      match: [
        /^[A-Za-z\s]+$/,
        "Le nom complet ne peut contenir que des lettres et des espaces",
      ],
    },
    username: {
      type: String,
      required: [true, "Veuillez renseigner le nom d'utilisateur"],
    },
    email: {
      type: String,
      required: [true, "Veuillez renseigner l'email"],
    },
    password: {
      type: String,
      required: [true, "Veuillez renseigner le mot de passe"],
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "pending",
    },
    avatar: {
      type: String,
      default: "default.png",
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);
userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Email adress should be in lower


  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  this.otp = undefined;
  this.otpExpires = undefined;
  this.status = "active";

  next();

  // Delete passwordConfirm field
});
export default mongoose.model<IUser>("User", userSchema);
