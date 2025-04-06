const Credit = require('../models/Credit');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Get all credits
exports.getCredits = async (req, res) => {
  try {
    const credits = await Credit.find().sort({ createdAt: -1 });
    res.status(200).json(credits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single credit
exports.getCredit = async (req, res) => {
  try {
    const credit = await Credit.findById(req.params.id);
    
    if (!credit) {
      return res.status(404).json({ error: 'Credit record not found' });
    }
    
    res.status(200).json(credit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a credit record
exports.createCredit = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Generate credit number
    const creditCount = await Credit.countDocuments();
    const creditNumber = String(creditCount + 1).padStart(3, '0');
    
    // Calculate total amount
    const totalAmount = req.body.items.reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);
    
    // Calculate remaining amount
    const remainingAmount = totalAmount - (req.body.paidAmount || 0);

    // Check inventory for each item
    for (const item of req.body.items) {
      const product = await Product.findOne({ name: item.name });
      if (!product) {
        throw new Error(`Product ${item.name} not found`);
      }
      if (product.quantity < item.quantity) {
        throw new Error(`Not enough inventory for ${item.name}. Available: ${product.quantity}, Required: ${item.quantity}`);
      }
      // Update inventory
      product.quantity -= item.quantity;
      await product.save({ session });
    }
    
    const credit = new Credit({
      creditNumber,
      customerName: req.body.customerName,
      phoneNumber: req.body.phoneNumber,
      items: req.body.items,
      creditDate: req.body.creditDate || new Date(),
      totalAmount,
      paidAmount: req.body.paidAmount || 0,
      remainingAmount,
      notes: req.body.notes,
      payments: req.body.payments || []
    });
    
    await credit.save({ session });
    await session.commitTransaction();
    res.status(201).json(credit);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

// Update a credit record
exports.updateCredit = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const oldCredit = await Credit.findById(req.params.id);
    if (!oldCredit) {
      throw new Error('Credit record not found');
    }

    // Return old items to inventory
    for (const oldItem of oldCredit.items) {
      const product = await Product.findOne({ name: oldItem.name });
      if (product) {
        product.quantity += oldItem.quantity;
        await product.save({ session });
      }
    }

    // Check and update inventory for new items
    for (const newItem of req.body.items) {
      const product = await Product.findOne({ name: newItem.name });
      if (!product) {
        throw new Error(`Product ${newItem.name} not found`);
      }
      if (product.quantity < newItem.quantity) {
        throw new Error(`Not enough inventory for ${newItem.name}. Available: ${product.quantity}, Required: ${newItem.quantity}`);
      }
      product.quantity -= newItem.quantity;
      await product.save({ session });
    }

    // Calculate new total amount
    const totalAmount = req.body.items.reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);

    const remainingAmount = totalAmount - (req.body.paidAmount || oldCredit.paidAmount);

    const updatedCredit = await Credit.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        totalAmount,
        remainingAmount,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true, session }
    );
    
    await session.commitTransaction();
    res.status(200).json(updatedCredit);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

// Delete a credit record
exports.deleteCredit = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const credit = await Credit.findById(req.params.id);
    if (!credit) {
      throw new Error('Credit record not found');
    }

    await Credit.findByIdAndDelete(req.params.id, { session });
    await session.commitTransaction();
    
    res.status(200).json({ message: 'Credit record deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

// Add a payment to a credit record
exports.addPayment = async (req, res) => {
  try {
    const credit = await Credit.findById(req.params.id);
    
    if (!credit) {
      return res.status(404).json({ error: 'Credit record not found' });
    }
    
    const payment = {
      amount: req.body.amount,
      paymentDate: req.body.paymentDate || new Date(),
      notes: req.body.notes
    };
    
    credit.payments.push(payment);
    credit.paidAmount += payment.amount;
    credit.remainingAmount = credit.totalAmount - credit.paidAmount;
    credit.updatedAt = Date.now();
    
    const updatedCredit = await credit.save();
    res.status(200).json(updatedCredit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 