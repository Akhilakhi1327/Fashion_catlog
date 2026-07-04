const Admin = require('../models/Admin');

const seedAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({
        name: 'Super Admin',
        email: process.env.ADMIN_EMAIL || 'admin@elitefashion.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
        role: 'superadmin',
      });
      console.log('✅ Default admin seeded successfully');
      console.log(`   Email: ${process.env.ADMIN_EMAIL || 'admin@elitefashion.com'}`);
      console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    } else {
      console.log('ℹ️  Admin already exists, skipping seed');
    }
  } catch (error) {
    console.error('❌ Admin seed error:', error.message);
  }
};

module.exports = seedAdmin;
