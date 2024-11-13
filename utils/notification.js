// Manage user connections

// notification.js
const sendNotification = (userId, event, data) => {
  const socketId = global.userConnections[userId]; // Get the socketId for the user
  if (socketId) {
    global.io.to(socketId).emit(event, data); // Emit an event using global.io
  }
};

module.exports = { sendNotification };
