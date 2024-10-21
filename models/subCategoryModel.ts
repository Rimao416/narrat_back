import mongoose, { Schema } from "mongoose";
export interface ISubCategory {
  name: string;
  category: mongoose.Schema.Types.ObjectId;
}
const subCategorySchema: Schema<ISubCategory> =
  new mongoose.Schema<ISubCategory>(
    {
      name: { type: String, required: true },
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    },
    {
      timestamps: true, // Automatically add createdAt and updatedAt fields
    }
  );

subCategorySchema.set("toObject", { virtuals: true });
subCategorySchema.set("toJSON", { virtuals: true });

const subCategoryModel = mongoose.model<ISubCategory>(
  "SubCategory",
  subCategorySchema
);

export default subCategoryModel;
