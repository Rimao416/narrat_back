import mongoose, { model } from "mongoose";
export interface ICategory {
  name: string;
}
const categorySchema = new mongoose.Schema<ICategory>({
  name: { type: String, required: true },
});
categorySchema.set("toJSON", {
  virtuals: true,
  versionKey: false, // Retire __v
  transform: function (doc, ret) {
    delete ret._id;
  },
});
export default model<ICategory>("Category", categorySchema);
