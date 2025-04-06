const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../../models/User');
const Product = require('../../models/Product');
const Order = require('../../models/Order');
const Credit = require('../../models/Credit');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected for seeding...'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample data
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Credit.deleteMany({});
    
    console.log('Data cleared successfully');
    
    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    const admin = await User.create({
      username: 'admin',
      password: hashedPassword,
      name: 'Administrator',
      role: 'admin'
    });
    
    console.log('Admin user created');
    
    // Create sample products
    const products = await Product.insertMany([
      {
        name: 'Product 1',
        description: 'Description for Product 1',
        quantity: 100,
        price: 25000,
        category: 'Electronics',
      },
      {
        name: 'Product 2',
        description: 'Description for Product 2',
        quantity: 50,
        price: 15000,
        category: 'Clothing',
      },
      {
        name: 'Product 3',
        description: 'Description for Product 3',
        quantity: 75,
        price: 35000,
        category: 'Home Goods',
      },
    ]);
    
    console.log('Sample products created');
    
    // Create sample orders
    const orders = await Order.insertMany([
      {
        orderNumber: '001',
        customerName: 'John Doe',
        items: [
          { name: 'Product 1', quantity: 50, returned: 5, price: 25000 },
          { name: 'Product 2', quantity: 30, returned: 0, price: 15000 },
        ],
        orderDate: new Date('2024-03-15'),
        totalAmount: 1725000,
      },
      {
        orderNumber: '002',
        customerName: 'Jane Smith',
        items: [
          { name: 'Product 2', quantity: 100, returned: 10, price: 15000 },
        ],
        orderDate: new Date('2024-03-14'),
        totalAmount: 1350000,
      },
    ]);
    
    console.log('Sample orders created');
    
    // Create sample credits
    const credits = await Credit.insertMany([
      {
        creditNumber: '001',
        customerName: 'Alex Johnson',
        phoneNumber: '+998901234567',
        items: [
          { name: 'Product 1', quantity: 20, price: 25000 },
          { name: 'Product 3', quantity: 10, price: 35000 },
        ],
        creditDate: new Date('2024-03-10'),
        totalAmount: 850000,
        paidAmount: 400000,
        remainingAmount: 450000,
        dueDate: new Date('2024-04-10'),
        status: 'Active',
        payments: [
          {
            amount: 400000,
            paymentDate: new Date('2024-03-15'),
            notes: 'First payment'
          }
        ],
        notes: 'Customer promised to pay the remaining amount by due date'
      },
      {
        creditNumber: '002',
        customerName: 'Sarah Williams',
        phoneNumber: '+998907654321',
        items: [
          { name: 'Product 2', quantity: 40, price: 15000 },
        ],
        creditDate: new Date('2024-03-05'),
        totalAmount: 600000,
        paidAmount: 600000,
        remainingAmount: 0,
        dueDate: new Date('2024-04-05'),
        status: 'Paid',
        payments: [
          {
            amount: 300000,
            paymentDate: new Date('2024-03-10'),
            notes: 'First payment'
          },
          {
            amount: 300000,
            paymentDate: new Date('2024-03-20'),
            notes: 'Final payment'
          }
        ],
        notes: 'Payment completed'
      },
    ]);
    
    console.log('Sample credits created');
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData(); 