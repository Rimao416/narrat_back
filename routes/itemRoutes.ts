import {Router} from "express"
import { getItems } from "../controllers/itemController"

const router: Router = Router()

router.route("/").get(getItems)
export default router