import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import adminRoutes from './routes/adminRoutes';
import customerRoutes from './routes/customerRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
// ... import other modules

dotenv.config();
const app = express();
app.use(express.json());

connectDB();

app.use('/api/admin', adminRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
// ... add other routes

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
