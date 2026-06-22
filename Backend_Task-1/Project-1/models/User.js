const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
      max: [120, 'Age must be realistic'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
