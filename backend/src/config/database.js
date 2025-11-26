const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ Error: MONGODB_URI is not defined in .env file');
      console.log('💡 Please create a .env file with your MongoDB connection string');
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check your MONGODB_URI in .env file');
    console.log('   2. Verify MongoDB Atlas IP whitelist includes your IP');
    console.log('   3. Check username and password are correct');
    console.log('   4. Ensure your MongoDB cluster is running\n');
    process.exit(1);
  }
};

module.exports = connectDB;

