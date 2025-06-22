// Simple rate limiting middleware
const rateLimit = (options = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute
    max = 45, // Limit each IP to 45 requests per windowMs
    message = "Too many requests, please try again later.",
    statusCode = 429,
    standardHeaders = true, // Send standard rate limit headers with limit info
  } = options;

  const requests = new Map();

  // Return middleware function
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    // Clean up old entries
    if (!requests.has(ip)) {
      requests.set(ip, []);
    }

    const ipRequests = requests.get(ip).filter((time) => now - time < windowMs);
    requests.set(ip, ipRequests);

    // Check if the IP has reached the limit
    if (ipRequests.length >= max) {
      if (standardHeaders) {
        res.setHeader("Retry-After", Math.ceil(windowMs / 1000));
        res.setHeader("X-RateLimit-Limit", max);
        res.setHeader(
          "X-RateLimit-Remaining",
          Math.max(0, max - ipRequests.length)
        );
      }
      return res.status(statusCode).json({ message });
    }

    // Add the current request to the list
    ipRequests.push(now);
    requests.set(ip, ipRequests);

    next();
  };
};


export default rateLimit;