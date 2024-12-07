const authLimiter = async (req, res, next) => {
  const ip = req.ip;
  const authCounts =
    authLimiter.authCounts || (authLimiter.authCounts = new Map());
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

export default authLimiter;
