import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import subCategoryModel from "../models/subCategoryModel";
export const getsubCategories = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const subCategories = await subCategoryModel.find();
    res.status(200).json({
      status: "success",
      data: subCategories,
    });
  }
);

export const addsubCategory = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const subcategory = await subCategoryModel.create(req.body);
    res.status(201).json({
      status: "success",
      data: subcategory,
    });
  }
);

export const deleteAllSubCategories=catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    await subCategoryModel.deleteMany();
    res.status(201).json({
      status: "success",
    });
  }
)