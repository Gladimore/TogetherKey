import express from "express";
import cors from "cors";

// Environment variables
const TOGETHER_API_KEY = process.env["TOGETHER_API_KEY"];
const API_PASSWORD = process.env["API_PASSWORD"];

// Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Authentication rate limiter
import authLimiter from "./authLimiter.js";

app.post("/api", authLimiter, (req, res) => {
  const { password } = req.body;

  if (password === API_PASSWORD) {
    // If password is correct, reset the rate limiter
    authLimiter.reset(req.ip);
    res.status(200).json(TOGETHER_API_KEY);
  } else {
    res.status(401).json({ error: "Password is incorrect" });
  }
});

// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
