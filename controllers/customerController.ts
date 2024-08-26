import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import categoryModel from "../models/categoryModel";
export const getCategories = catchAsync(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const categories = await categoryModel.find();
    res.status(200).json({
      status: "success",
      data: categories,
    });
  }
);

export const addCategory = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const category = await categoryModel.create(req.body);
    res.status(201).json({
      status: "success",
      data: category,
    });
  }
);
