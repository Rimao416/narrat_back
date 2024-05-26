import mongoose, { model } from "mongoose";
export interface IAudioChapter {
  title: string;
  audio: string;
  description: string;
}
export interface IAudioFormat {
  available: boolean;
  chapters: IAudioChapter[];
}

export interface IBook {
  isbn: string;
  title: string;
  pages: number;
  description: string;
  content: string;
  cover: string;
  year: number;
  authors: string[]; // Reference to multiple authors
  statut: string;
  audio: IAudioFormat;
  category: string[];
}

const audioChapterSchema = new mongoose.Schema<IAudioChapter>({
  title: {
    type: String,
    required: [true, "Veuillez renseigner le titre du chapitre audio"],
  },
  audio: {
    type: String,
    required: [true, "Veuillez renseigner le lien du chapitre audio"],
  },
  description: {
    type: String,
    required: [true, "Veuillez renseigner la description du chapitre audio"],
  },
});

const audioFormatSchema = new mongoose.Schema<IAudioFormat>({
  available: {
    type: Boolean,
    required: [true, "Veuillez indiquer si le format audio est disponible"],
    default: false,
  },
  chapters: [audioChapterSchema],
});

const bookSchema = new mongoose.Schema<IBook>({
  isbn: {
    type: String,
    required: [true, "Veuillez renseigner l'ISBN du livre"],
  },
  title: {
    type: String,
    required: [true, "Veuillez renseigner le titre du livre"],
  },
  pages: {
    type: Number,
    required: true,
    min: 1,
  },
  description: {
    type: String,
    // required: true,
  },
  content: {
    type: String,
    // required: true,
  },
  cover: {
    type: String,
    // required: true,
  },
  authors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: [true, "Veuillez renseigner l'auteur du livre"],
    },
  ],
  statut: {
    type: String,
    enum: ["disponible", "desactivé"],
    default: "disponible",
  },
  audio: {
    type: audioFormatSchema,
    // required: [true, "Veuillez renseigner le format audio du livre"],
  },
  category: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
});
bookSchema.set("toJSON", {
  virtuals: true,
  versionKey: false, // Retire __v
  transform: function (doc, ret) {
    delete ret._id;
  },
});

export default model<IBook>("Book", bookSchema);
