import { NextFunction, Request, Response } from "express";

import { Router } from "express";
import { validateUserInput } from "../controllers/authController";
const router: Router = Router();
router.route("/sign").post(
  validateUserInput,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      status: "success",
      message: "user authenticated",
    });
  }
);
export default router;