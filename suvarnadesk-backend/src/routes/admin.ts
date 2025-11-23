import express from "express";
import Admin from "../models/Admin";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const router = express.Router();

// Register
router.post("/register", async (req, res) => {
    const { email, password } = req.body;
    const admin = new Admin({ email, password });
    await admin.save();
    res.json({ success: true });
});

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ error: "Invalid credentials" });
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET!, { expiresIn: "1d" });
    res.json({ token });
});

export default router;
