import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const auth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.jwt || req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, no token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      console.error("Invalid token provided");
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, invalid token" });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded?.email,
      username: decoded?.name,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Authentication error" });
  }
};
