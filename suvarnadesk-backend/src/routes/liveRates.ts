// routes/liveRates.ts
import { Router } from 'express';
import { liveRateController } from '../controllers/liveRateController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all active live rates
router.get('/', liveRateController.getActiveRates);

// Get rates summary
router.get('/summary', liveRateController.getRatesSummary);

// Get specific live rate by metal type and purity
router.get('/:metalType/:purity', liveRateController.getRateByMetalAndPurity);

// Get rate history
router.get('/:metalType/:purity/history', liveRateController.getRateHistory);

// Create or update live rate
router.post('/', liveRateController.createOrUpdateRate);

// Bulk update rates
router.post('/bulk', liveRateController.bulkUpdateRates);

// Update rates from external source
router.post('/refresh-external', liveRateController.updateFromExternalSource);

export default router;