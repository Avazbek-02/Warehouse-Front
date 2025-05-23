const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single order
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create an order
exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = String(orderCount + 1).padStart(3, '0');
    
    // Create order
    const order = new Order({
      orderNumber,
      customerName: req.body.customerName,
      items: req.body.items,
      orderDate: req.body.orderDate || new Date(),
      totalAmount: req.body.totalAmount
    });

    // Update inventory for each item
    for (const item of req.body.items) {
      const product = await Product.findOne({ name: item.name });
      if (!product) {
        throw new Error(`Product ${item.name} not found`);
      }

      // Hisoblash: ketgan - qaytgan = inventorydan ayiriladigan miqdor
      const netQuantity = item.quantity - (item.returned || 0);
      
      if (product.quantity < netQuantity) {
        throw new Error(`Not enough inventory for ${item.name}. Available: ${product.quantity}, Required: ${netQuantity}`);
      }

      // Inventoryni yangilash
      product.quantity -= netQuantity;
      await product.save({ session });
    }

    await order.save({ session });
    await session.commitTransaction();
    
    res.status(201).json(order);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

// Update an order
exports.updateOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const oldOrder = req.body.originalOrder || await Order.findById(req.params.id);
    if (!oldOrder) {
      throw new Error('Order not found');
    }

    // Har bir mahsulot uchun omborni yangilash
    for (const newItem of req.body.items) {
      const product = await Product.findOne({ name: newItem.name });
      if (!product) {
        throw new Error(`Product ${newItem.name} not found`);
      }

      // Eski buyurtmadagi shu mahsulotni topish
      const oldItem = oldOrder.items.find(item => item.name === newItem.name);
      
      if (oldItem) {
        // Eski va yangi sof miqdorlarni hisoblash (buyurtma - qaytarilgan)
        const oldNetQuantity = oldItem.quantity - (oldItem.returned || 0);
        const newNetQuantity = newItem.quantity - (newItem.returned || 0);
        
        // Farqni hisoblash
        const quantityDifference = newNetQuantity - oldNetQuantity;
        
        // Agar farq musbat bo'lsa, ombordan ayirish
        // Agar manfiy bo'lsa, omborga qaytarish
        product.quantity -= quantityDifference;
        
        // Ombordagi miqdor manfiy bo'lmasligi kerak
        if (product.quantity < 0) {
          throw new Error(`Not enough inventory for ${product.name}. Available: ${product.quantity + quantityDifference}`);
        }
      } else {
        // Yangi qo'shilgan mahsulot - to'liq miqdorni ombordan ayirish
        const requestedQuantity = newItem.quantity - (newItem.returned || 0);
        if (requestedQuantity > product.quantity) {
          throw new Error(`Not enough inventory for ${newItem.name}. Available: ${product.quantity}`);
        }
        product.quantity -= requestedQuantity;
      }
      
      await product.save({ session });
    }

    // Eski buyurtmadagi, lekin yangi buyurtmada yo'q mahsulotlarni omborga qaytarish
    for (const oldItem of oldOrder.items) {
      const stillExists = req.body.items.some(item => item.name === oldItem.name);
      if (!stillExists) {
        const product = await Product.findOne({ name: oldItem.name });
        if (product) {
          // Sof miqdorni omborga qaytarish (buyurtma - qaytarilgan)
          const returnQuantity = oldItem.quantity - (oldItem.returned || 0);
          product.quantity += returnQuantity;
          await product.save({ session });
        }
      }
    }

    // Buyurtmani yangilash
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        items: req.body.items.map(item => ({
          ...item,
          returned: item.returned || 0
        })),
        updatedAt: Date.now()
      },
      { new: true, runValidators: true, session }
    );

    await session.commitTransaction();
    res.status(200).json(updatedOrder);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

// Delete an order
exports.deleteOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new Error('Order not found');
    }

    // Return items to inventory
    for (const item of order.items) {
      const product = await Product.findOne({ name: item.name });
      if (product) {
        // Inventoryga qaytarish: ketgan - qaytgan = qo'shiladigan miqdor
        const netQuantity = item.quantity - (item.returned || 0);
        product.quantity += netQuantity;
        await product.save({ session });
      }
    }

    await Order.findByIdAndDelete(req.params.id, { session });
    await session.commitTransaction();
    
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
}; 