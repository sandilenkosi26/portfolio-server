// =========================================================
// Sandile Nkosi — Portfolio Contact Server
// Node.js + Express + Nodemailer
// =========================================================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// -----------------------------------------------------------
// Mail transporter
// Uses Gmail + an App Password (NOT your normal Gmail password).
// How to get an App Password:
//   1. Turn on 2-Step Verification on your Google account.
//   2. Go to https://myaccount.google.com/apppasswords
//   3. Generate a password for "Mail" and paste it into .env as EMAIL_PASS.
// -----------------------------------------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // sandilenkosi267@gmail.com
    pass: process.env.EMAIL_PASS  // 16-character Gmail App Password
  }
});

// Basic sanity check on boot
transporter.verify((err) => {
  if (err) {
    console.error("✗ Mail transporter not ready:", err.message);
  } else {
    console.log("✓ Mail transporter ready");
  }
});

// -----------------------------------------------------------
// POST /send  — receives { name, email, message } from the
// contact form and emails it to Sandile.
// -----------------------------------------------------------
app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  const mailOptions = {
    from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
    to: "sandilenkosi267@gmail.com",
    replyTo: email,
    subject: `New portfolio message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `
      <div style="font-family:sans-serif; line-height:1.6;">
        <h2>New message from your portfolio</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Email sent successfully." });
  } catch (error) {
    console.error("Error sending email:", error.message);
    res.status(500).json({ error: "Failed to send email." });
  }
});

app.get("/", (req, res) => {
  res.send("Portfolio contact server is running.");
});

app.listen(PORT, () => {
  console.log(`✓ Server listening on http://localhost:${PORT}`);
});
