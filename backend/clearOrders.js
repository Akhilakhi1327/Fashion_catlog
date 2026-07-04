require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');

const clearOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
    
    await Order.deleteMany();
    console.log('Orders cleared');
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

clearOrders();
