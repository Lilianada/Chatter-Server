const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const htmlToText = require("html-to-text");

// Set up your mailer, using SMTP or a service like SendGrid, Mailgun, etc.
const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.SENDER_EMAIL,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.CLIENT_REFRESH_TOKEN,
  },
  tls: {
    rejectUnauthorized: false, // This is usually not recommended in production
  },
});
console.log(
  "Sender email:",
  process.env.SENDER_EMAIL,
  "Client ID:",
  process.env.CLIENT_ID,
  "Client Secret:",
  process.env.CLIENT_SECRET,
  "user",
  user
);

exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  console.log("A new user signed up!", user);
  const email = user.email; // Extract email from user object
  const displayName = user.displayName || "New User";
  const subject = `Welcome to the Conversation, ${displayName}`;
  const message = `
        <p>Dear gentle reader,</p>
        <p>Welcome to Chatter! We're thrilled to have you join our vibrant community of readers, writers, and thinkers.</p>
        <p> Whether you're here to explore new ideas, share your own voice, or simply connect with like-minded individuals, Medium is your platform.
        We can't wait to see what you contribute to the conversation!</p>
        <p>Happy reading (and writing!),</p>
        <p>Your friends at Chatter</p>
    `;

  const mailOptions = {
    from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
    to: email,
    subject: htmlToText.fromString(subject),
    text: htmlToText.fromString(message, {
      wordwrap: 130,
    }),
    html: message,
  };

  try {
    await mailTransport.sendMail(mailOptions);
    return console.log("Welcome email sent to:", email);
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
});
