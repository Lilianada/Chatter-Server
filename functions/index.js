/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

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

exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  console.log("A new user signed up!", user);
  const email = user.email; // Extract email from user object
  const displayName = user.displayName || "New User";
  const subject = `Welcome to the Conversation, ${displayName}`;
  const htmlMessage = `
  <p>Dear gentle reader,</p>
  <p>Welcome to Chatter! We're thrilled to have you join our vibrant 
  community of readers, writers, and thinkers.</p>
  <p>Whether you're here to explore new ideas, share your own voice, 
  or simply connect with like-minded individuals, Medium is your platform. 
  We can't wait to see what you contribute to the conversation!</p>
  <p>Happy reading (and writing!),</p>
  <p>Your friends at Chatter</p>
`;

  const mailOptions = {
    from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
    to: email,
    subject: htmlToText.fromString(subject, {wordwrap: 130}),
    text: htmlToText.fromString(htmlMessage, {wordwrap: 130}),
    html: htmlMessage,
  };


  try {
    await mailTransport.sendMail(mailOptions);
    console.log("Welcome email sent to:", email);
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
});
