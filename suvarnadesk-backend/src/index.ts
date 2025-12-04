import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { rateUpdateJob } from './jobs/rateUpdateJob';

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
import metalRateRoutes from "./routes/metalRateRoutes";
import shopSettingsRoutes from "./routes/settingsRoutes";
import pdfRoutes from "./routes/pdfRoutes";
import liveRatesRouter from './routes/liveRates';
import ratesRoutes from './routes/ratesRoutes';

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
app.use("/api/metal-rates", metalRateRoutes);
app.use("/api/shop-settings", shopSettingsRoutes);
app.use("/api/pdf", pdfRoutes);
app.use('/api/customers', customerRoutes);
// Routes
app.use('/api/live-rates', liveRatesRouter);
app.use('/api/rates', ratesRoutes);
// Start rate update job
rateUpdateJob.start();

// Basic healthcheck route
app.get("/", (req, res) => {
    res.send("SuvarnaDesk API running!");
});
