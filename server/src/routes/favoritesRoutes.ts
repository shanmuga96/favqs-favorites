import { Router } from "express";
import { favoritesController } from "../controllers/favoritesController";

const router = Router();

const { getFavorites, saveFavorite, removeFavorite } = favoritesController;

router.get( '/favorites', getFavorites );
router.post( '/favorites', saveFavorite );
router.delete( '/favorites/:id', removeFavorite );

export default router;