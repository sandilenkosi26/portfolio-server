// =========================================================
// Sandile Nkosi — Portfolio Contact Server
// Node.js + Express + Resend (HTTP email API)
//
// Switched from Nodemailer/SMTP to Resend because Render's free
// tier blocks outbound SMTP ports (25/465/587), causing
// "Connection timeout" errors no matter which port Nodemailer uses.
// Resend sends email over a normal HTTPS API call instead, which
// is not blocked.
// =========================================================
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// -----------------------------------------------------------
// Resend setup
// How to get an API key:
//   1. Sign up free at https://resend.com (no credit card needed)
//   2. Go to API Keys → Create API Key → copy it
//   3. Paste it into .env (locally) or Render's Environment tab as RESEND_API_KEY
//
// For the "from" address: Resend requires either their shared
// testing address (onboarding@resend.dev) or a domain you've
// verified in Resend. Using onboarding@resend.dev works immediately
// with no setup — good enough for a portfolio contact form.
// -----------------------------------------------------------
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL = "sandilenkosi267@gmail.com";
const FROM_EMAIL = "Portfolio Contact Form <onboarding@resend.dev>";

if (!RESEND_API_KEY) {
  console.error("✗ RESEND_API_KEY is not set. Add it to your .env or Render Environment variables.");
} else {
  console.log("✓ Resend API key loaded");
}

// -----------------------------------------------------------
// POST /send  — receives { name, email, message } from the
// contact form and emails it to Sandile via Resend.
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

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        reply_to: email,
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
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Resend API error:", response.status, errorBody);
      return res.status(500).json({ error: "Failed to send email." });
    }

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
