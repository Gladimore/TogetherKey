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
const authLimiter = async (req, res, next) => {
  const ip = req.ip;
  const authCounts = authLimiter.authCounts || (authLimiter.authCounts = new Map());
  const now = Date.now();
  const max = 5; // Allow 5 incorrect attempts within 5 minutes
  const windowMs = 5 * 60 * 1000;

  let count = authCounts.get(ip);
  if (!count) {
    count = { requests: 0, timestamp: now };
  }

  if (now - count.timestamp > windowMs) {
    count.requests = 0;
    count.timestamp = now;
  }

  if (count.requests >= max) {
    const retryAfter = Math.ceil((count.timestamp + windowMs - now) / 1000);
    res.set("Retry-After", retryAfter);
    res.status(429).json({
      error: "Too many incorrect password attempts. Please try again later.",
    });
    return;
  }

  count.requests++;
  authCounts.set(ip, count);

  next();
};

authLimiter.reset = (ip) => {
  const authCounts = authLimiter.authCounts;
  if (authCounts) {
    authCounts.delete(ip);
  }
};

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
