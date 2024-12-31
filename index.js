import express from "express";
import cors from "cors";
import expressRateLimit from "express-rate-limit";

// Environment variables
const TOGETHER_API_KEY = process.env["TOGETHER_API_KEY"];
const API_PASSWORD = process.env["API_PASSWORD"];

// Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const rateLimiter = expressRateLimit({
  windowMs: 60 * 60000, // 60 minutes
  max: 2, // Limit each IP to 2 requests per windowMs
  skip: (req) => req.body.password === API_PASSWORD, // Skip rate limiting if password is correct
  message: "Too many requests, please try again later.", // Message when rate limit is exceeded
});

app.post("/api", rateLimiter, (req, res) => {
  const { password } = req.body;

  if (password === API_PASSWORD) {
    res.status(200).json({ key: TOGETHER_API_KEY });
  } else {
    res.status(401).json({ error: "Password is incorrect" });
  }
});

// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
