import { Router } from "express";
import { quoteController } from "../controllers/quoteController";

const router = Router();

router.get( '/quote', quoteController.getQuote );

export default router;