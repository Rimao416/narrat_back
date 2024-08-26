import mongoose from "mongoose";

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
      enum: ["active", "inactive"],
      default: "active",
    },
    avatar: {
      type: String,
      default: "default.png",
    },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model<IUser>("User", userSchema);
