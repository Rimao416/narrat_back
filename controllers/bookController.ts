import { NextFunction, Request, Response } from "express";
import bookModel from "../models/bookModel";
import catchAsync from "../utils/catchAsync";
import multer, { FileFilterCallback, StorageEngine } from "multer";
import AppError from "../utils/appError";

const multerStorage: StorageEngine = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "cover") {
      cb(null, "./public/img");
    } else if (file.fieldname === "content") {
      cb(null, "./public/documents");
    }
    // cb(null, "./public/documents");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});
// Typage de la fonction multerFilter
const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (
    file.fieldname === "cover" &&
    (file.mimetype === "image/jpeg" || file.mimetype === "image/png")
  ) {
    cb(null, true); // Acceptez le fichier si c'est une image JPEG ou PNG
  } else if (
    file.fieldname === "content" &&
    file.mimetype === "application/pdf"
  ) {
    cb(null, true); // Acceptez le fichier si c'est un fichier PDF
  } else {
    new AppError("Mettez le format adéquat", 400); // Rejetez le fichier sinon
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
export const uploadUserDocument = upload.fields([
  { name: "cover", maxCount: 1 },
  { name: "content", maxCount: 1 },
]);
// Typing for files in request
interface MulterFiles {
  [fieldname: string]: Express.Multer.File[];
}
export const createBook = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as MulterFiles;
    if (!req.body.authors) {
      return next(new AppError("Veuillez fournir des auteurs", 400));
    }
    if (!files || !files["cover"] || !files["content"]) {
      return next(
        new AppError(
          "Veuillez fournir des fichiers (photo de couverture, documents PDF)",
          400
        )
      );
    }

    const book = await bookModel.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        book,
      },
    });
  }
);

export const getBooks = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const books = await bookModel.find().populate("authors");
    res.status(200).json({
      status: "success",
      data: books,
      length:books.length
    });
  }
);

export const getSingleBook = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const bookId = req.params.bookId;
    const books = await bookModel
      .findOne({ books: bookId })
      .populate("authors");
    res.status(200).json({
      status: "success",
      data: books,
    });
  }
);
