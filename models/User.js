// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: [true, "email already in use"],
  },
  password: {
    type: String,
    required: true,
  },
  walletBalance: {
    type: Number,
    default: 0, // Initial balance is 0
  },
  accountNumber: { type: String, unique: true }, // New field for account number
  otp: {
    type: Number, // or String, depending on your implementation
  },
  otpExpires: {
    type: Date,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  if (!this.accountNumber) {
    // Generate a random 10-digit account number
    this.accountNumber = Math.floor(
      1000000000 + Math.random() * 9000000000
    ).toString();
  }
  next();
});

// Compare entered password with stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
