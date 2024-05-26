import { Router } from "express";
import {
  createBook,
  getBooks,
  getSingleBook,
  uploadUserDocument,
} from "../controllers/bookController";
const router: Router = Router();
router.route("/").post(uploadUserDocument, createBook).get(getBooks);
router.route("/:bookId").get(getSingleBook);

export default router;
