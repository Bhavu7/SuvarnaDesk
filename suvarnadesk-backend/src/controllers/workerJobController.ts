import WorkerJob from "../models/WorkerJob";
import { Request, Response } from "express";

export const getWorkerJobs = async (req: Request, res: Response) => {
    try {
        const jobs = await WorkerJob.find()
            .populate("assignedTo", "name email")
            .populate("assignedBy", "name email");
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch worker jobs" });
    }
};

// TEST: Bhavesh Git sync check


export const createWorkerJob = async (req: Request, res: Response) => {
    try {
        const { title, description, assignedTo, priority, dueDate } = req.body;

        const job = new WorkerJob({
            title,
            description,
            assignedTo,
            assignedBy: (req as any).admin.adminId,
            priority,
            dueDate
        });

        await job.save();
        await job.populate("assignedTo", "name email");

        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ error: "Failed to create worker job" });
    }
};

export const updateWorkerJob = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const job = await WorkerJob.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        ).populate("assignedTo", "name email");

        res.json(job);
    } catch (error) {
        res.status(500).json({ error: "Failed to update worker job" });
    }
};