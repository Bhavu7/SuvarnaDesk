import express from 'express';
import {
    getMetalRates,
    getActiveMetalRates,
    createMetalRate,
    updateMetalRate,
    deleteMetalRate,
    getCurrentRates
} from '../controllers/metalRateController';

const router = express.Router();

// GET /api/metal-rates - Get all metal rates
router.get('/', getMetalRates);

// GET /api/metal-rates/active - Get active metal rates
router.get('/active', getActiveMetalRates);

// GET /api/metal-rates/current - Get current rates for billing
router.get('/current', getCurrentRates);

// POST /api/metal-rates - Create new metal rate
router.post('/', createMetalRate);

// PUT /api/metal-rates/:id - Update metal rate
router.put('/:id', updateMetalRate);

// DELETE /api/metal-rates/:id - Delete metal rate
router.delete('/:id', deleteMetalRate);

export default router;