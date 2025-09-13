// db.js
require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect("mongodb+srv://sathvika:malathi_suresh@cluster0.yz2psmg.mongodb.net/deliveryDB?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ Connection error:', err);
    process.exit(1); // Stop if DB connection fails
  }
}

// User schema
const userSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  language: { type: String, required: true },
  location: { type: String },
  isActive: { type: Boolean, default: true },
  rating: { type: Number, min: 0, max: 5 },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// Daily stats schema
const dailyStatsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  earnings: { type: Number, required: true },
  deliveries: { type: Number, required: true },
  hoursOnline: { type: Number, required: true },
  OrdersNotified: {type: Number, default: 0},
  OrdersAccepted: {type: Number, default: 0}
});
const DailyStats = mongoose.model('DailyStats', dailyStatsSchema);

// Function to create/find user and save daily stats
async function createUserAndStats() {
  try {
    let user = await User.findOne({ phoneNumber: '+1234567890' });
    if (!user) {
      user = new User({
        phoneNumber: '+1234567890',
        language: 'English',
        location: 'Delhi',
        isActive: true,
        rating: 4.5,
        OrdersNotified:5,
        OrdersAccepted:3

    });
      await user.save();
      console.log('✅ User created:', user);
    } else {
      console.log('ℹ️ User already exists:', user);
    }

    const stats = new DailyStats({
      user: user._id,
      earnings: 1200,
      deliveries: 15,
      hoursOnline: 8
    });

    const savedStats = await stats.save();
    console.log('✅ Daily stats saved:', savedStats);
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

module.exports = { connectDB, createUserAndStats };
