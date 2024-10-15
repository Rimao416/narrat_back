import mongoose, { Schema, Document } from "mongoose";
import customerModel from "./customerModel";

// Interface for Item
export interface IItem extends Document {
  title: string;
  description: string;
  price: number;
  categories: mongoose.Schema.Types.ObjectId[] | string[]; // Reference to categories
  condition: "new" | "used";
  // media: { type: "image" | "video"; url: string }[];
  media: { type: "image" | "video"; url: string }[];
  seller: mongoose.Schema.Types.ObjectId; // Reference to the user who is selling the item
  likes: mongoose.Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Schema for Item
const itemSchema: Schema<IItem> = new mongoose.Schema<IItem>(
  {
    title: {
      type: String,
      required: [true, "Veuillez renseigner le titre de l'article"],
    },
    description: {
      type: String,
      required: [true, "Veuillez renseigner la description de l'article"],
    },
    price: {
      type: Number,
      required: [true, "Veuillez renseigner le prix de l'article"],
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
    condition: {
      type: String,
      enum: ["new", "used"],
      required: [true, "Veuillez renseigner l'état de l'article"],
    },
    media: {
      type: [
        {
          type: {
            type: String,
            enum: ["image", "video"],
            // required: true,
          },
          url: {
            type: String,
            // required: true,
          },
        },
      ],
      validate: {
        validator: function (v: { type: "image" | "video"; url: string }[]) {
          return v.length <= 8;
        },
        message: "Vous ne pouvez pas ajouter plus de 8 médias.",
      },
      default: [],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Veuillez renseigner le vendeur de l'article"],
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Custom validation to check the total number of media
itemSchema.pre("validate", function (next) {
  const item = this as IItem;
  if (item.media.length > 8) {
    next(new Error("Le total des images et vidéos ne peut pas dépasser 8."));
  } else {
    next();
  }
});
itemSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const item = this as unknown as IItem;
      await customerModel.updateOne(
        { _id: item.seller },
        { $pull: { items: item._id } }
      );
      next();
    } catch (error) {
      next(error as Error);
    }
  }
);

itemSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function () {
    try {
      await customerModel.updateOne(
        { _id: this.seller },
        { $pull: { items: this._id } }
      );
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de la référence de l'article du customer :",
        error
      );
    }
  }
);

const itemModel = mongoose.model<IItem>("Item", itemSchema);

export default itemModel;
