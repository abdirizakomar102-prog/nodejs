import Item from "../model/itemModel.js";
import Order from "../model/orderModel.js";

// Create a new item
export async function createItem(req, res) {
  try {
    const { name, description, price, category, stockQuantity } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        message: "Missing required fields: name, price, category",
      });
    }

    const item = await Item.create({
      name,
      description,
      price,
      category,
      stockQuantity: stockQuantity || 0,
    });

    return res.status(201).json({
      message: "Item created successfully",
      item,
    });
  } catch (error) {
    console.error("Error creating item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Get all items
export async function getAllItems(req, res) {
  try {
    const { page = 1, limit = 10, search = "", category, minPrice, maxPrice } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const items = await Item.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Item.countDocuments(query);

    return res.status(200).json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Get item by ID
export async function getItemById(req, res) {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json({ item });
  } catch (error) {
    console.error("Error fetching item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Update item
export async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const item = await Item.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json({
      message: "Item updated successfully",
      item,
    });
  } catch (error) {
    console.error("Error updating item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Delete item
export async function deleteItem(req, res) {
  try {
    const { id } = req.params;

    // Check if item is used in any orders
    const orderCount = await Order.countDocuments({
      "items.item": id,
    });
    
    if (orderCount > 0) {
      return res.status(400).json({
        message: "Cannot delete item that is used in existing orders",
        orderCount,
      });
    }

    const item = await Item.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json({
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Update item stock
export async function updateItemStock(req, res) {
  try {
    const { id } = req.params;
    const { quantity, operation = "add" } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be a positive number",
      });
    }

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (operation === "add") {
      item.stockQuantity += quantity;
    } else if (operation === "subtract") {
      if (item.stockQuantity < quantity) {
        return res.status(400).json({
          message: "Insufficient stock",
          available: item.stockQuantity,
          requested: quantity,
        });
      }
      item.stockQuantity -= quantity;
    } else {
      return res.status(400).json({
        message: 'Invalid operation. Use "add" or "subtract"',
      });
    }

    await item.save();

    return res.status(200).json({
      message: `Stock ${operation === "add" ? "increased" : "decreased"} successfully`,
      item,
    });
  } catch (error) {
    console.error("Error updating item stock:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}