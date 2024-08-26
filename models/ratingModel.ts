import mongoose, { Schema, Document } from "mongoose";

// Interface for Rating
export interface IRating extends Document {
  user: mongoose.Schema.Types.ObjectId;
  customer: mongoose.Schema.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

// Schema for Rating
const ratingSchema: Schema<IRating> = new mongoose.Schema<IRating>(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

ratingSchema.set("toObject", { virtuals: true });
ratingSchema.set("toJSON", { virtuals: true });

const ratingModel = mongoose.model<IRating>("Rating", ratingSchema);

export default ratingModel;
