import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import itemModel from "../models/itemModel";
import APIFeatures from "../utils/apiFeatures";
export const getItems = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const features = new APIFeatures(
      itemModel.find().populate("categories seller"),
      req.query
    ).paginate();
    const items = await features.query;
    const totalItems = await features.countTotalItems();
    res.status(200).json({
      status: "success",
      length: items.length,
      data: items,
      totalItems: totalItems,
    });
  }
);
