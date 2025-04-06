const mongoose = require('mongoose');

const CreditItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

const PaymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  }
});

const CreditSchema = new mongoose.Schema({
  creditNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String
  },
  items: [CreditItemSchema],
  creditDate: {
    type: Date,
    default: Date.now
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  remainingAmount: {
    type: Number,
    min: 0
  },
  dueDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Active', 'Paid', 'Overdue'],
    default: 'Active'
  },
  payments: [PaymentSchema],
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Tugallanmagan summa hisoblanadi
CreditSchema.pre('save', function(next) {
  this.remainingAmount = this.totalAmount - this.paidAmount;
  
  // Status yangilanadi
  if (this.remainingAmount <= 0) {
    this.status = 'Paid';
  } else if (this.dueDate && this.dueDate < new Date()) {
    this.status = 'Overdue';
  } else {
    this.status = 'Active';
  }
  
  next();
});

module.exports = mongoose.model('Credit', CreditSchema); 