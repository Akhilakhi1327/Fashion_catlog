require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Admin.deleteMany({});
    console.log('Old admins deleted. seedAdmin will create the new one upon server start.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

resetAdmin();
