import { Router } from "express";
import Admin from "../models/Admin";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

/**
 * Register Admin (for initial setup)
 */
router.post("/register", async (req, res) => {
    const { email, password } = req.body;
    if (await Admin.findOne({ email })) {
        return res.status(400).json({ error: "Admin already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const admin = new Admin({ email, password: hashedPassword });
    await admin.save();
    res.json({ success: true });
});

/**
 * Login Admin
 */
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ error: "Invalid credentials" });
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET!, { expiresIn: "1d" });
    res.json({ token, admin: { id: admin._id, email: admin.email } });
});

export default router;
