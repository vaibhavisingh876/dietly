// backend/middleware/authmiddleware.js
import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: "No token provided" });

    const token = authHeader.split(" ")[1]; // Expecting format: "Token <token>"
    if (!token) return res.status(401).json({ success: false, message: "Invalid token format" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretKey");
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    console.error("JWT auth error:", err);
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
}
