import mongoose, { Schema } from "mongoose";
import userModel, { IUser } from "./userModel";
// import { IRating } from "./ratingModel";
import ratingModel from "./ratingModel";

// Interface for Customer which extends IUser
export interface ICustomer extends IUser {
  address: {
    street: string;
    city: string;
    state: string;
  };
  phoneNumber: string;
  bio: string;
  countryCode: string;
  ratings: any;
  // ratings: IRating[] | mongoose.Schema.Types.ObjectId[];
  // items: mongoose.Schema.Types.ObjectId[] | string[]; // Reference to items
  items: any; // Reference to items
  averageRating: number;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema for Customer
const customerSchema: Schema<ICustomer> = new mongoose.Schema<ICustomer>(
  {
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
    },
    phoneNumber: { type: String, required: true },
    bio: { type: String, required: true },
    countryCode: {
      type: String,
      // validate: {
      //   validator: function (value: string) {
      //     return value.length === 3;
      //   },
      //   message: "Le code de pays doit contenir deux caractères",
      // },
      enum: {
        values: ["+243", "+242"],
        message: "Le code pays doit être +243 ou +242.",
      },
      required: [true, "Le code pays est requis."],
    },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
    ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rating" }],
    averageRating: { type: Number, default: 0 },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);
customerSchema.methods.generateOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000);
  this.otp = otp;
  this.otpExpires = new Date(Date.now() + 3 * 60 * 60 * 1000);

  return otp;
};

customerSchema.set("toObject", { virtuals: true });
customerSchema.set("toJSON", { virtuals: true });

customerSchema.pre("validate", function (next) {
  this.role = "customer";
  next();
});

customerSchema.pre("save", async function (next) {
  if (this.ratings.length > 0) {
    const ratings = await ratingModel.find({ customer: this._id });
    const sum = ratings.reduce((total, rating) => total + rating.rating, 0);
    this.averageRating = sum / ratings.length;
  } else {
    this.averageRating = 0;
  }
  next();
});

const customerModel = userModel.discriminator<ICustomer>(
  "Customer",
  customerSchema
);

export default customerModel;
