import { Router } from "express";
import { addCategory, getCategories } from "../controllers/categoryController";
const router: Router = Router();
router.route("/").get(getCategories).post(addCategory);

export default router;
