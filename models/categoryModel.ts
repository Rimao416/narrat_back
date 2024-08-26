import mongoose, { Schema } from "mongoose";
export interface ICategory {
  name: string;
}
const categorySchema:Schema<ICategory> = new mongoose.Schema<ICategory>({
  name: { type: String, required: true },
});
categorySchema.set("toJSON", {
  virtuals: true,
  versionKey: false, // Retire __v
  transform: function (doc, ret) {
    delete ret._id;
  },
});
const categoryModel=mongoose.model<ICategory>("Category", categorySchema);
export default categoryModel;
