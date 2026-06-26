import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config({ path: '../.env' });

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gitpulse');
    console.log('Connected to MongoDB');

    const email = 'agrathod0701@gmail.com';
    const name = 'Admin User';
    const password = 'Aarti@0107';
    const securityQuestion = "What was the name of your first pet?";
    const securityAnswer = "fluffy";

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Update existing user
      user.name = name;
      user.password = password;
      user.securityQuestion = securityQuestion;
      user.securityAnswer = securityAnswer;
      await user.save();
      console.log('Admin user updated successfully!');
    } else {
      // Create new admin user
      user = await User.create({
        name,
        email,
        password,
        securityQuestion,
        securityAnswer,
      });
      console.log('Admin user created successfully!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();
