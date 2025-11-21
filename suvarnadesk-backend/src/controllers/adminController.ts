import Admin from '../models/Admin';
import { hashPassword, comparePassword } from '../utils/hashPassword';
import jwt from 'jsonwebtoken';

export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await comparePassword(password, admin.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ adminId: admin._id, role: admin.role }, process.env.JWT_SECRET || '', { expiresIn: '12h' });
    res.json({ token, admin });
};

export const registerAdmin = async (req, res) => {
    const { name, email, password, phone } = req.body;
    const hash = await hashPassword(password);
    const admin = new Admin({ name, email, password: hash, phone });
    await admin.save();
    res.status(201).json(admin);
};
