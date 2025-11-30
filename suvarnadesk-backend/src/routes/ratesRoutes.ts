import express from 'express';
import axios from 'axios';

const router = express.Router();

// GET /api/rates/live - Get live metal rates
router.get('/live', async (req, res) => {
    try {
        const METAL_PRICE_API_KEY = process.env.METAL_PRICE_API_KEY;

        if (!METAL_PRICE_API_KEY) {
            return res.status(500).json({
                error: 'Metal price API key not configured'
            });
        }

        const response = await axios.get(
            `https://api.metalpriceapi.com/v1/latest?api_key=${METAL_PRICE_API_KEY}&base=USD&currencies=XAU,XAG`
        );

        // Process and return the data
        const rates = {
            gold: response.data.rates.XAU,
            silver: response.data.rates.XAG,
            timestamp: new Date().toISOString()
        };

        res.json(rates);
    } catch (error) {
        console.error('Error fetching metal rates:', error);
        res.status(500).json({
            error: 'Failed to fetch live metal rates',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;