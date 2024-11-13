const { sendOtpEmail } = require("./emailService");
const { sendNotification } = require("./notification");

module.exports = {
  sendOtpEmail,
  sendNotification,
};
