import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import authorModel from "../models/authorModel";
import multer, { FileFilterCallback } from "multer";
import AppError from "../utils/appError";
import sharp from "sharp";

const multerStorage = multer.memoryStorage();
const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    new AppError("Not an image! Please upload only images.", 400);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadUserPhoto = upload.single("photo");
export const resizeUserPhoto = catchAsync(async (req, res, next) => {
  console.log(req.file);
  if (!req.file) return next();
  // console.log(req.file)

  req.file.filename = `user-${Date.now()}.jpeg`;
  req.body.photo = req.file.filename;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/${req.file.filename}`);

  next();
});
export const addAuthor = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const author = await authorModel.create(req.body);
    res.status(201).json({
      status: "success",
      data: author,
    });
  }
);

export const getAuthors = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const authors = await authorModel.find().populate("books");
    res.status(200).json({
      status: "success",
      data: authors,
    });
  }
);


