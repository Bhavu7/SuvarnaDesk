import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

import adminRoutes from "./routes/adminRoutes";
app.use("/api/admin", adminRoutes);

mongoose.connect(process.env.MONGO_URI!)
    .then(() => app.listen(4000, () => console.log("Server started on port 4000")))
    .catch(err => console.error("DB connection error:", err));
