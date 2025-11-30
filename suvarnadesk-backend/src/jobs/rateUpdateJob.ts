// jobs/rateUpdateJob.ts
import cron from 'node-cron';
import { liveRateService } from '../services/liveRateService';

export class RateUpdateJob {
    private isRunning: boolean = false;

    start(): void {
        // Update rates every hour (at minute 0)
        cron.schedule('0 * * * *', async () => {
            if (this.isRunning) {
                console.log('Rate update already in progress, skipping...');
                return;
            }

            this.isRunning = true;

            try {
                console.log('Starting live rates update...');
                const updatedRates = await liveRateService.updateRatesFromExternalSource();
                console.log(`Live rates updated successfully. Updated ${updatedRates.length} rates.`);
            } catch (error) {
                console.error('Failed to update live rates:', error);
            } finally {
                this.isRunning = false;
            }
        });

        // Also update on startup
        this.initializeRates();

        console.log('Rate update job started');
    }

    private async initializeRates(): Promise<void> {
        try {
            const activeRates = await liveRateService.getActiveRates();

            if (activeRates.length === 0) {
                console.log('No active rates found, fetching initial rates...');
                await liveRateService.updateRatesFromExternalSource();
            } else {
                console.log(`Found ${activeRates.length} active rates`);
            }
        } catch (error) {
            console.error('Failed to initialize rates:', error);
        }
    }

    stop(): void {
        this.isRunning = false;
    }
}

export const rateUpdateJob = new RateUpdateJob();