import Order from "../model/orderModel.js";
import Customer from "../model/customerModel.js";
import Item from "../model/itemModel.js";

// Create a new order
export async function createOrder(req, res) {
  try {
    const { customerId, items, shippingAddress, notes } = req.body;

    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({
        message: "Missing required fields: customerId, items",
      });
    }

    // Check if customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Validate items and check stock
    const orderItems = [];
    for (const itemData of items) {
      const item = await Item.findById(itemData.itemId);
      if (!item) {
        return res.status(404).json({
          message: `Item not found: ${itemData.itemId}`,
        });
      }

      if (item.stockQuantity < itemData.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for item: ${item.name}`,
          item: item.name,
          available: item.stockQuantity,
          requested: itemData.quantity,
        });
      }

      orderItems.push({
        item: itemData.itemId,
        quantity: itemData.quantity,
        priceAtTime: item.price,
      });

      // Reduce stock quantity
      item.stockQuantity -= itemData.quantity;
      await item.save();
    }

    // Calculate initial total amount
    const initialTotal = orderItems.reduce(
      (total, item) => total + item.priceAtTime * item.quantity,
      0
    );

    // Create order
    const order = await Order.create({
      customer: customerId,
      items: orderItems,
      shippingAddress: shippingAddress || customer.address,
      notes,
      status: "pending",
      totalAmount: initialTotal, // Provide initial total
    });

    // Populate the created order with item details
    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "name email phone")
      .populate("items.item", "name price category");

    return res.status(201).json({
      message: "Order created successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Get all orders
export async function getAllOrders(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      customerId,
      startDate,
      endDate,
    } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (customerId) {
      query.customer = customerId;
    }
    
    if (startDate || endDate) {
      query.orderDate = {};
      if (startDate) query.orderDate.$gte = new Date(startDate);
      if (endDate) query.orderDate.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate("customer", "name email phone")
      .populate("items.item", "name price")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ orderDate: -1 });

    const total = await Order.countDocuments(query);

    return res.status(200).json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Get order by ID
export async function getOrderById(req, res) {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("customer", "name email phone address")
      .populate("items.item", "name price category description");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Update order status
export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Valid statuses: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    )
      .populate("customer", "name email")
      .populate("items.item", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Cancel order (with stock restoration)
export async function cancelOrder(req, res) {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    // Restore stock for cancelled items
    for (const orderItem of order.items) {
      const item = await Item.findById(orderItem.item);
      if (item) {
        item.stockQuantity += orderItem.quantity;
        await item.save();
      }
    }

    // Update order status to cancelled
    order.status = "cancelled";
    await order.save();

    return res.status(200).json({
      message: "Order cancelled successfully, stock restored",
      order,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Add item to existing order
export async function addItemToOrder(req, res) {
  try {
    const { id } = req.params;
    const { itemId, quantity } = req.body;

    if (!itemId || !quantity || quantity <= 0) {
      return res.status(400).json({
        message: "Missing or invalid itemId or quantity",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        message: "Can only add items to pending orders",
      });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.stockQuantity < quantity) {
      return res.status(400).json({
        message: "Insufficient stock",
        available: item.stockQuantity,
        requested: quantity,
      });
    }

    // Add item to order
    order.items.push({
      item: itemId,
      quantity,
      priceAtTime: item.price,
    });

    // Reduce stock
    item.stockQuantity -= quantity;
    await item.save();

    // Save order (totalAmount will be recalculated by pre-save hook)
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("customer", "name email")
      .populate("items.item", "name price");

    return res.status(200).json({
      message: "Item added to order successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error adding item to order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}