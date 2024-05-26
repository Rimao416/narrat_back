import mongoose, { model } from "mongoose";

export interface IAuthor {
  id: string;
  fullname: string;
  bio: string;
  photo: string;
  books: string[];
  surname?: string;
  nationality: string;
  email: string;
  website: string;
}

const authorSchema = new mongoose.Schema<IAuthor>({
  fullname: {
    type: String,
    required: [true, "Veuillez renseigner le nom de l'auteur"],
  },
  bio: {
    type: String,
    // required: true,
  },
  photo: {
    type: String,
    default: "default.png",
    // required: true,
  },
  books: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    },
  ],
  surname: {
    type: String,
    // required: true,
  },
  nationality: {
    type: String,
    // required: true,
  },
  email: {
    type: String,
    // required: true,
  },
  website: {
    type: String,
    // required: true,
  },
});
authorSchema.set("toJSON", {
  virtuals: true,
  versionKey: false, // Retire __v
  transform: function (doc, ret) {
    delete ret._id;
  },
});
export default model<IAuthor>("Author", authorSchema);
