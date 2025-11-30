import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import pdfRoutes from "./routes/pdfRoutes";
import liveRatesRouter from './routes/liveRates';
import { rateUpdateJob } from './jobs/rateUpdateJob';
import ratesRoutes from './routes/ratesRoutes';

dotenv.config();

const app = express();
app.use(cors({
    origin: "http://localhost:3000",  // Your frontend origin
    credentials: true                 // Allow cookies and auth headers
}));

app.use(express.json());

// Import routes
import adminRoutes from "./routes/adminRoutes";
import customerRoutes from "./routes/customerRoutes";
import invoiceRoutes from "./routes/invoiceRoutes";
import labourChargeRoutes from "./routes/labourChargeRoutes";
import metalRateRoutes from "./routes/metalRateRoutes";
import workerJobRoutes from "./routes/workerJobRoutes";
import shopSettingsRoutes from "./routes/settingsRoutes";

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI!, {})
    .then(() => {
        console.log("MongoDB connected");
        // Start server
        const PORT = process.env.PORT || 4000;
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    })
    .catch((err) => {
        console.error("DB connection error:", err);
        process.exit(1);
    });

// Mount all routes
app.use("/api/admin", adminRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/labour-charges", labourChargeRoutes);
app.use("/api/metal-rates", metalRateRoutes);
app.use("/api/worker-jobs", workerJobRoutes);
app.use("/api/shop-settings", shopSettingsRoutes);
app.use("/api/pdf", pdfRoutes);
// Routes
app.use('/api/live-rates', liveRatesRouter);
app.use('/api/rates', ratesRoutes);
// Start rate update job
rateUpdateJob.start();

// Basic healthcheck route
app.get("/", (req, res) => {
    res.send("SuvarnaDesk API running!");
});
