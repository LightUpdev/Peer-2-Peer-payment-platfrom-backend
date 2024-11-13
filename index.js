// index.js
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const dotenv = require("dotenv");
var bodyParser = require("body-parser");
const walletRoutes = require("./routes/wallet");
const http = require("http");
const { Server } = require('socket.io');
const socketIo = require("socket.io");
const cors = require("cors");

// Load environment variables
dotenv.config();

const app = express();

// Create an HTTP server to attach Socket.IO to
const server = http.createServer(app);

// Manage user connections
global.userConnections = {}; // A simple object to map userId -> socketId

// Create a Socket.IO instance, attaching it to the HTTP server
global.io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for testing purposes (not secure for production)
    methods: ["GET", "POST"], // Allow only GET and POST requests
    allowedHeaders: ["Content-Type"],
    credentials: true
  },
});

// When a new connection is made
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id); // Log connection

  // Listen for a custom event where the client tells us their userId
  socket.on("userLogin", (userId) => {
    userConnections[userId] = socket.id; // Map userId to the socketId
    console.log(`User ${userId} connected with socket ${socket.id}`);
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    // Remove user from connections when they disconnect
    for (const [userId, socketId] of Object.entries(userConnections)) {
      if (socketId === socket.id) {
        delete userConnections[userId]; // Remove the mapping of the disconnected user
        console.log(`User ${userId} disconnected`);
      }
    }
  });
});
// cross-origin-resource
app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Body parser to accept JSON data
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes); // Wallet-related routes

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Connect to database
connectDB();
