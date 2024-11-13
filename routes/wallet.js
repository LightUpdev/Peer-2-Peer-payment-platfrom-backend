// routes/wallet.js
const express = require("express");
const {
  getWalletBalance,
  addFunds,
  getTransactionHistory,
  initiateTransfer,
  completeTransfer,
} = require("../controllers/walletController");
const { protect } = require("../middlewares/authMiddleware"); // Auth middleware to protect routes

const router = express.Router();

// @route   GET /api/wallet/balance
// @desc    Get wallet balance for logged-in user
// @access  Private
router.get("/balance", protect, getWalletBalance);

// @route   POST /api/wallet/add-funds
// @desc    Add funds to wallet
// @access  Private
router.post("/add-funds", protect, addFunds);

// @route   POST /api/wallet/initiate-transfer
// @desc    Initiate transfer and send OTP
// @access  Private
router.post('/initiate-transfer', protect, initiateTransfer);

// @route   POST /api/wallet/complete-transfer
// @desc    Complete transfer after OTP verification
// @access  Private
router.post('/complete-transfer', protect, completeTransfer);


// @route   GET /api/wallet/transactions
// @desc    Get transaction history for logged-in user
// @access  Private
router.get("/transactions", protect, getTransactionHistory);

module.exports = router;
