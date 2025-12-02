// jobs/rateUpdateJob.ts
import * as cron from 'node-cron';
import { LiveRate } from '../models/LiveRate';
import MetalRate, { IMetalRate } from '../models/MetalRate';

export interface IExternalRate {
    metalType: 'gold' | 'silver';
    purity: string;
    ratePerGram: number;
    timestamp: Date;
}

export class RateUpdateJob {
    private isRunning: boolean = false;

    // Mock external API call - replace with actual API integration
    private async fetchRatesFromExternalAPI(): Promise<IExternalRate[]> {
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mock data - replace with actual API response
            const mockRates: IExternalRate[] = [
                {
                    metalType: 'gold',
                    purity: '24K',
                    ratePerGram: 6500 + Math.random() * 100, // Randomize for demo
                    timestamp: new Date()
                },
                {
                    metalType: 'gold',
                    purity: '22K',
                    ratePerGram: 6000 + Math.random() * 100,
                    timestamp: new Date()
                },
                {
                    metalType: 'gold',
                    purity: '18K',
                    ratePerGram: 5000 + Math.random() * 100,
                    timestamp: new Date()
                },
                {
                    metalType: 'silver',
                    purity: 'Standard',
                    ratePerGram: 80 + Math.random() * 10,
                    timestamp: new Date()
                },
                {
                    metalType: 'silver',
                    purity: 'Sterling',
                    ratePerGram: 85 + Math.random() * 10,
                    timestamp: new Date()
                }
            ];

            return mockRates;
        } catch (error) {
            console.error('Error fetching rates from external API:', error);
            throw new Error('Failed to fetch rates from external API');
        }
    }

    // Update both LiveRate and MetalRate collections
    private async updateRates(): Promise<void> {
        if (this.isRunning) {
            console.log('Rate update already in progress...');
            return;
        }

        this.isRunning = true;
        console.log('Starting rate update...');

        try {
            // Fetch rates from external API
            const externalRates = await this.fetchRatesFromExternalAPI();

            // Update LiveRate collection
            await this.updateLiveRates(externalRates);

            // Update MetalRate collection
            await this.updateMetalRates(externalRates);

            console.log(`Successfully updated ${externalRates.length} rates`);
        } catch (error) {
            console.error('Failed to update rates:', error);
        } finally {
            this.isRunning = false;
        }
    }

    // Update LiveRate collection
    private async updateLiveRates(rates: IExternalRate[]): Promise<void> {
        try {
            // Deactivate all current live rates
            await LiveRate.updateMany(
                { isActive: true },
                { isActive: false }
            );

            // Create new live rates
            const liveRates = rates.map(rate => ({
                metalType: rate.metalType,
                purity: rate.purity,
                ratePerGram: Math.round(rate.ratePerGram * 100) / 100, // Round to 2 decimal places
                source: 'api' as const,
                lastUpdated: new Date()
            }));

            await LiveRate.insertMany(liveRates);
            console.log(`Updated ${liveRates.length} live rates`);
        } catch (error) {
            console.error('Error updating live rates:', error);
            throw error;
        }
    }

    // Update MetalRate collection
    private async updateMetalRates(rates: IExternalRate[]): Promise<void> {
        try {
            // Deactivate current active metal rates that were from API
            await MetalRate.updateMany(
                { isActive: true, source: 'api' },
                { isActive: false }
            );

            // Create new metal rates
            const metalRates = rates.map(rate => ({
                metalType: rate.metalType,
                purity: rate.purity,
                ratePerGram: Math.round(rate.ratePerGram * 100) / 100,
                effectiveFrom: new Date(),
                source: 'api' as const
            }));

            await MetalRate.insertMany(metalRates);
            console.log(`Updated ${metalRates.length} metal rates`);
        } catch (error) {
            console.error('Error updating metal rates:', error);
            throw error;
        }
    }

    // Initialize rates on startup
    public async initializeRates(): Promise<void> {
        try {
            const activeLiveRates = await LiveRate.countDocuments({ isActive: true });

            if (activeLiveRates === 0) {
                console.log('No active live rates found. Fetching initial rates...');
                await this.updateRates();
            } else {
                console.log(`Found ${activeLiveRates} active live rates`);
            }
        } catch (error) {
            console.error('Error initializing rates:', error);
        }
    }

    // Start the cron job
    public start(): void {
        // Update rates every hour (at minute 0)
        cron.schedule('0 * * * *', async () => {
            console.log('Running scheduled rate update...');
            await this.updateRates();
        });

        // Update rates every 10 minutes for testing (optional)
        if (process.env.NODE_ENV === 'development') {
            cron.schedule('*/10 * * * *', async () => {
                console.log('Running development rate update...');
                await this.updateRates();
            });
        }

        // Initialize rates on startup
        this.initializeRates();

        // console.log('Rate update job started successfully');
    }

    // Manual trigger for rate update
    public async manualUpdate(): Promise<{ success: boolean; message: string }> {
        try {
            await this.updateRates();
            return { success: true, message: 'Rates updated successfully' };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return { success: false, message: `Failed to update rates: ${errorMessage}` };
        }
    }

    // Get update status
    public getStatus(): { isRunning: boolean } {
        return { isRunning: this.isRunning };
    }
}

export const rateUpdateJob = new RateUpdateJob();