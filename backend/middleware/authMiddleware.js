import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  try {
    // Ensure JWT secret is configured on the server
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: "Server configuration error" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    // Accept only "Bearer <token>" format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Invalid token format" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Invalid token format" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    console.error("JWT auth error:", err);
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
}