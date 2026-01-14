import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  addItemToOrder,
} from "../controller/orderController.js";
import { authMiddleware, autherizationMiddleware } from "../middlewares/auth.middlewares.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Order CRUD operations
router.post("/", createOrder); // Allow users to create their own orders
router.get("/", autherizationMiddleware(["admin"]), getAllOrders); // Only admin can see all orders
router.get("/:id", getOrderById); // Users can see their own orders (need to add ownership check)

// Order management
router.patch("/:id/status", autherizationMiddleware(["admin"]), updateOrderStatus);
router.patch("/:id/cancel", cancelOrder); // Users can cancel their own orders

// Order items management
router.post("/:id/items", autherizationMiddleware(["admin"]), addItemToOrder);

export default router;