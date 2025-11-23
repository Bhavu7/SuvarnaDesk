import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Protect routes - only allow authenticated admin access
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) return res.status(401).json({ message: "No token provided." });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        (req as any).admin = decoded;
        next();
    } catch {
        return res.status(401).json({ message: "Invalid token." });
    }
};
