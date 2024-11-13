// controllers/walletController.js
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const crypto = require("crypto");
const { sendOtpEmail } = require("../utils");
const { sendNotification } = require("../utils");

// @desc    Get wallet balance for logged-in user
// @route   GET /api/wallet/balance
// @access  Private
exports.getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("walletBalance");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ walletBalance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc    Add funds to wallet
// @route   POST /api/wallet/add-funds
exports.addFunds = async (req, res) => {
  const { amount } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add funds to wallet
    user.walletBalance += Number(amount);
    await user.save();

    res.json({ message: `Funds added. New balance: ${user.walletBalance}` });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// controllers/walletController.js

// @desc Transfer funds between users (Step 1: Send OTP)
exports.initiateTransfer = async (req, res) => {
  try {
    const { recipientAccountNumber, amount } = req.body;

    const sender = await User.findById(req.user.id);
    const recipient = await User.findOne({
      accountNumber: recipientAccountNumber,
    }); // Find recipient by account number

    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999); // 6-digit OTP
    sender.otp = otp;
    sender.otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    await sender.save();

    // Create a transaction with status 'Pending'
    const transaction = new Transaction({
      sender: req.user.id,
      recipient: recipient.id, // Still referencing the recipient ID in the transaction
      amount,
      status: "Pending",
    });

    await transaction.save();

    // Send OTP to sender
    // Send OTP to user's email
    await sendOtpEmail(sender.email, otp);

    // Emit a real-time notification to the sender
    sendNotification(sender.id, "transactionInitiated", {
      message: `You initiated a transfer of ${amount} to ${recipient.username}.`,
      transaction,
    });

    res
      .status(200)
      .json({ message: "Transfer initiated, OTP sent", transaction });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Complete the transfer after OTP verification
exports.completeTransfer = async (req, res) => {
  try {
    const { otp, transactionId } = req.body;

    const transaction = await Transaction.findById(transactionId);
    const sender = await User.findById(req.user.id);

    if (!transaction || transaction.sender.toString() !== req.user.id) {
      return res.status(400).json({ message: "Invalid transaction or sender" });
    }

    // Check OTP validation
    if (
      !sender.otp ||
      sender.otp !== Number(otp) ||
      Date.now() > sender.otpExpires
    ) {
      transaction.status = "Failed";
      await transaction.save();

      // Emit real-time failure notification
      io.emit("transaction-failed", {
        senderId: sender._id,
        message: "Transaction failed due to incorrect OTP.",
      });

      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const recipient = await User.findById(transaction.recipient); // Recipient found by ID

    if (sender.walletBalance < transaction.amount) {
      transaction.status = "Failed";
      await transaction.save();

      // Emit real-time notification for insufficient funds
      io.emit("transaction-failed", {
        senderId: sender._id,
        message: "Transaction failed due to insufficient funds.",
      });

      return res.status(400).json({ message: "Insufficient funds" });
    }

    sender.walletBalance -= transaction.amount;
    recipient.walletBalance += transaction.amount;

    await sender.save();
    await recipient.save();

    // Update transaction status to Completed
    transaction.status = "Completed";
    await transaction.save();

    // Notify the sender about the successful transaction
    sendNotification(sender.id, "transactionCompleted", {
      message: `Transfer of ${transaction.amount} to ${recipient.username} was successful.`,
      transaction,
    });

    // Notify the recipient about the received funds
    sendNotification(recipient.id, "transactionReceived", {
      message: `You received ${transaction.amount} from ${sender.username}.`,
      transaction,
    });

    res.status(200).json({ message: "Transfer successful", transaction });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// controllers/walletController.js
exports.getTransactionHistory = async (req, res) => {
  try {
    // Find transactions where the user is either the sender or recipient
    const transactions = await Transaction.find({
      $or: [{ sender: req.user.id }, { recipient: req.user.id }],
    })
      .populate("sender", "username email") // Populate sender details
      .populate("recipient", "username email") // Populate recipient details
      .sort({ transactionDate: -1 }); // Sort by most recent transactions

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.transactionHistory = async (req, res) => {
  try {
    // Assuming `req.user.id` contains the logged-in user's ID
    const userId = req.user.id;

    // Fetch all transactions where the user is either the sender or recipient
    const transactions = await Transaction.find({
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .populate("sender recipient", "username accountNumber")
      .sort({ createdAt: -1 }); // Sort by most recent transactions

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
