import express from "express";
import {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  updateItemStock,
} from "../controller/itemController.js";
import { authMiddleware, autherizationMiddleware } from "../middlewares/auth.middlewares.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Item CRUD operations
router.post("/", autherizationMiddleware(["admin"]), createItem);
router.get("/", getAllItems);
router.get("/:id", getItemById);
router.put("/:id", autherizationMiddleware(["admin"]), updateItem);
router.delete("/:id", autherizationMiddleware(["admin"]), deleteItem);

// Item stock management
router.patch("/:id/stock", autherizationMiddleware(["admin"]), updateItemStock);

export default router;