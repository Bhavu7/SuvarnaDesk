// controllers/liveRateController.ts
import { Request, Response } from 'express';
import { liveRateService } from '../services/liveRateService';
import { ILiveRateInput, IBulkRateInput, IRateHistoryQuery } from '../types/liveRate';

export class LiveRateController {
    // Get all active live rates
    async getActiveRates(req: Request, res: Response): Promise<void> {
        try {
            const rates = await liveRateService.getActiveRates();
            res.json(rates);
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to fetch live rates'
            });
        }
    }

    // Get rates by metal type
    async getRatesByMetalType(req: Request, res: Response): Promise<void> {
        try {
            const { metalType } = req.params;
            if (metalType !== 'gold' && metalType !== 'silver') {
                res.status(400).json({ error: 'Invalid metal type. Must be "gold" or "silver"' });
                return;
            }

            const rates = await liveRateService.getRatesByMetalType(metalType);
            res.json(rates);
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to fetch rates by metal type'
            });
        }
    }

    // Get specific live rate by metal type and purity
    async getRateByMetalAndPurity(req: Request, res: Response): Promise<void> {
        try {
            const { metalType, purity } = req.params;
            const rate = await liveRateService.getRateByMetalAndPurity(metalType, purity);

            if (!rate) {
                res.status(404).json({ error: 'Rate not found' });
                return;
            }

            res.json(rate);
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to fetch rate'
            });
        }
    }

    // Create or update live rate
    async createOrUpdateRate(req: Request, res: Response): Promise<void> {
        try {
            const rateData: ILiveRateInput = req.body;

            // Validate required fields
            if (!rateData.metalType || !rateData.purity || !rateData.ratePerGram) {
                res.status(400).json({ error: 'metalType, purity, and ratePerGram are required' });
                return;
            }

            const rate = await liveRateService.createOrUpdateRate(rateData);
            res.status(201).json(rate);
        } catch (error) {
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Failed to create/update rate'
            });
        }
    }

    // Bulk update rates
    async bulkUpdateRates(req: Request, res: Response): Promise<void> {
        try {
            const { rates }: IBulkRateInput = req.body;

            if (!rates || !Array.isArray(rates)) {
                res.status(400).json({ error: 'rates array is required' });
                return;
            }

            const results = await liveRateService.bulkUpdateRates(rates);
            res.status(201).json(results);
        } catch (error) {
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Failed to bulk update rates'
            });
        }
    }

    // Get rate history
    async getRateHistory(req: Request, res: Response): Promise<void> {
        try {
            const { metalType, purity } = req.params;
            const { days = 7 } = req.query as IRateHistoryQuery;

            const history = await liveRateService.getRateHistory(
                metalType,
                purity,
                parseInt(days.toString())
            );

            res.json(history);
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to fetch rate history'
            });
        }
    }

    // Get rates summary
    async getRatesSummary(req: Request, res: Response): Promise<void> {
        try {
            const summary = await liveRateService.getRatesSummary();
            res.json(summary);
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to fetch rates summary'
            });
        }
    }

    // Update rates from external source
    async updateFromExternalSource(req: Request, res: Response): Promise<void> {
        try {
            const updatedRates = await liveRateService.updateRatesFromExternalSource();
            res.json({
                message: 'Rates updated successfully from external source',
                rates: updatedRates,
                count: updatedRates.length
            });
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to update rates from external source'
            });
        }
    }

    // Sync live rates to metal rates
    async syncToMetalRates(req: Request, res: Response): Promise<void> {
        try {
            const metalRates = await liveRateService.syncToMetalRates();
            res.json({
                message: 'Rates synced to metal rates successfully',
                metalRates,
                count: metalRates.length
            });
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to sync rates to metal rates'
            });
        }
    }

    // Compare live rates with metal rates
    async compareWithMetalRates(req: Request, res: Response): Promise<void> {
        try {
            const comparison = await liveRateService.compareWithMetalRates();
            res.json(comparison);
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to compare rates'
            });
        }
    }

    // Check if rates need update
    async checkRatesNeedUpdate(req: Request, res: Response): Promise<void> {
        try {
            const needsUpdate = await liveRateService.needsUpdate();
            const lastUpdate = await liveRateService.getLastUpdateTime();

            res.json({
                needsUpdate,
                lastUpdate,
                message: needsUpdate ? 'Rates should be updated' : 'Rates are up to date'
            });
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to check rates update status'
            });
        }
    }

    // Get last update time
    async getLastUpdateTime(req: Request, res: Response): Promise<void> {
        try {
            const lastUpdate = await liveRateService.getLastUpdateTime();
            res.json({ lastUpdate });
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to get last update time'
            });
        }
    }
}

export const liveRateController = new LiveRateController();