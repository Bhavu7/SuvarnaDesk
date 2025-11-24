import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized, no token" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        // Attach admin info to req object
        (req as any).admin = {
            adminId: decoded.adminId,
            role: decoded.role,
        };
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized, token invalid" });
    }
};
