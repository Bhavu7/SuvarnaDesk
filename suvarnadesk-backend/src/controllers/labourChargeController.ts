import LabourCharge from "../models/LabourCharge";
import { Request, Response } from "express";

export const getLabourCharges = async (req: Request, res: Response) => {
    const charges = await LabourCharge.find({ isActive: true });
    res.json(charges);
};

export const createLabourCharge = async (req: Request, res: Response) => {
    const { name, chargeType, amount } = req.body;
    const charge = new LabourCharge({ name, chargeType, amount });
    await charge.save();
    res.status(201).json(charge);
};

export const updateLabourCharge = async (req: Request, res: Response) => {
    const { id } = req.params;
    const charge = await LabourCharge.findByIdAndUpdate(id, req.body, { new: true });
    res.json(charge);
};

export const deleteLabourCharge = async (req: Request, res: Response) => {
    const { id } = req.params;
    await LabourCharge.findByIdAndUpdate(id, { isActive: false });
    res.json({ message: "Labour charge deactivated" });
};