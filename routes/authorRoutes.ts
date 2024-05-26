import { Router } from "express";
import { addAuthor,uploadUserPhoto,resizeUserPhoto, getAuthors } from "../controllers/authorController";
const router: Router = Router();
router.route("/").post(uploadUserPhoto, resizeUserPhoto, addAuthor);
router.route("/").get(getAuthors)
export default router;
