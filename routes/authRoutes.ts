import { Router } from "express";
import { validateOtp, validatePassword, validateUserInput } from "../controllers/authController";
const router: Router = Router();
// Route pour validateUserInput
router.post("/validateUser", validateUserInput);

// Route pour validateOtp (si nécessaire)
router.post("/validateOtp", validateOtp);
router.post("/validatePassword",validatePassword)

// router.route("/sign").post(
//   validateUserInput,
//   validateOtp,
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   (req: Request, res: Response, next: NextFunction) => {
//     res.status(200).json({
//       status: "success",
//       message: "user authenticated",
//     });
//   }
// );
export default router;
