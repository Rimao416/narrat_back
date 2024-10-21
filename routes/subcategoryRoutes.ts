import { Router } from "express";
import { addsubCategory, deleteAllSubCategories, getsubCategories } from "../controllers/subcategoryController";
addsubCategory
const router: Router = Router();
router.route("/").get(getsubCategories).post(addsubCategory).delete(deleteAllSubCategories);


export default router;
