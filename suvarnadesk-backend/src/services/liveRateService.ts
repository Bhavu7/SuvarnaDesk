// services/liveRateService.ts
import { LiveRate, ILiveRate } from '../models/LiveRate';
import MetalRate, { IMetalRate } from '../models/MetalRate';

export interface ILiveRateInput {
    metalType: 'gold' | 'silver';
    purity: string;
    ratePerGram: number;
    source?: 'manual' | 'api';
}

export interface IBulkRateInput {
    rates: ILiveRateInput[];
}

export interface IRateHistoryQuery {
    days?: number;
}

export interface IExternalRateSource {
    metalType: 'gold' | 'silver';
    purity: string;
    ratePerGram: number;
}

export interface IRatesSummary {
    gold: ILiveRate[];
    silver: ILiveRate[];
    lastUpdated: Date | null;
    totalRates: number;
}

export class LiveRateService {
    private readonly purityMultipliers: Record<string, number> = {
        '24K': 1.0,
        '22K': 0.916, // 22/24
        '18K': 0.75,  // 18/24
        'Standard': 1.0, // Silver standard
        'Sterling': 0.925 // Sterling silver
    };

    // Fetch rates from external API
    async fetchRatesFromAPI(): Promise<IExternalRateSource[]> {
        try {
            // Mock implementation - replace with actual API integration
            const mockRates: IExternalRateSource[] = [
                { metalType: 'gold', purity: '24K', ratePerGram: 6500 },
                { metalType: 'gold', purity: '22K', ratePerGram: 6000 },
                { metalType: 'gold', purity: '18K', ratePerGram: 5000 },
                { metalType: 'silver', purity: 'Standard', ratePerGram: 80 },
                { metalType: 'silver', purity: 'Sterling', ratePerGram: 85 }
            ];

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            return mockRates;
        } catch (error) {
            console.error('Error fetching rates from API:', error);
            throw new Error('Failed to fetch live rates from external source');
        }
    }

    // Update rates from external source
    async updateRatesFromExternalSource(): Promise<ILiveRate[]> {
        try {
            const rates = await this.fetchRatesFromAPI();

            // Deactivate old rates
            await LiveRate.updateMany(
                { isActive: true },
                { isActive: false }
            );

            // Create new rates
            const newRates = await LiveRate.insertMany(
                rates.map(rate => ({
                    ...rate,
                    source: 'api' as const,
                    lastUpdated: new Date()
                }))
            );

            return newRates;
        } catch (error) {
            console.error('Error updating rates from external source:', error);
            throw error;
        }
    }

    // Get all active live rates
    async getActiveRates(): Promise<ILiveRate[]> {
        return await LiveRate.find({ isActive: true }).sort({ metalType: 1, purity: 1 });
    }

    // Get specific live rate by metal type and purity
    async getRateByMetalAndPurity(metalType: string, purity: string): Promise<ILiveRate | null> {
        return await LiveRate.findOne({
            metalType,
            purity,
            isActive: true
        });
    }

    // Create or update live rate
    async createOrUpdateRate(rateData: ILiveRateInput): Promise<ILiveRate> {
        // Deactivate any existing active rate for this metalType and purity
        await LiveRate.updateMany(
            {
                metalType: rateData.metalType,
                purity: rateData.purity,
                isActive: true
            },
            { isActive: false }
        );

        // Create new active rate
        const newRate = new LiveRate({
            ...rateData,
            lastUpdated: new Date()
        });

        return await newRate.save();
    }

    // Bulk update rates
    async bulkUpdateRates(ratesData: ILiveRateInput[]): Promise<ILiveRate[]> {
        const results: ILiveRate[] = [];

        for (const rateData of ratesData) {
            const rate = await this.createOrUpdateRate(rateData);
            results.push(rate);
        }

        return results;
    }

    // Get rate history
    async getRateHistory(metalType: string, purity: string, days: number = 7): Promise<ILiveRate[]> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return await LiveRate.find({
            metalType,
            purity,
            createdAt: { $gte: startDate }
        }).sort({ createdAt: -1 });
    }

    // Calculate rate based on purity
    calculateRateByPurity(baseRate: number, purity: string): number {
        const multiplier = this.purityMultipliers[purity] || 1.0;
        return baseRate * multiplier;
    }

    // Get current rates summary
    async getRatesSummary(): Promise<IRatesSummary> {
        const rates = await this.getActiveRates();

        const goldRates = rates.filter(rate => rate.metalType === 'gold');
        const silverRates = rates.filter(rate => rate.metalType === 'silver');
        const lastUpdated = rates.length > 0
            ? new Date(Math.max(...rates.map(r => r.lastUpdated.getTime())))
            : null;

        return {
            gold: goldRates,
            silver: silverRates,
            lastUpdated,
            totalRates: rates.length
        };
    }

    // Sync live rates to metal rates (for backward compatibility)
    async syncToMetalRates(): Promise<IMetalRate[]> {
        const liveRates = await this.getActiveRates();
        const results: IMetalRate[] = [];

        // Deactivate current API metal rates
        await MetalRate.updateMany(
            { source: 'api', isActive: true },
            { isActive: false }
        );

        // Create new metal rates from live rates
        for (const liveRate of liveRates) {
            const metalRate = new MetalRate({
                metalType: liveRate.metalType,
                purity: liveRate.purity,
                ratePerGram: liveRate.ratePerGram,
                effectiveFrom: new Date(),
                source: 'api'
            });

            await metalRate.save();
            results.push(metalRate);
        }

        return results;
    }

    // Compare live rates with metal rates
    async compareWithMetalRates(): Promise<{
        liveRates: ILiveRate[];
        metalRates: IMetalRate[];
        differences: Array<{
            metalType: string;
            purity: string;
            liveRate: number;
            metalRate: number;
            difference: number;
        }>;
    }> {
        const liveRates = await this.getActiveRates();
        const metalRates = await MetalRate.find({ isActive: true });

        const differences = liveRates.map(liveRate => {
            const metalRate = metalRates.find(
                mr => mr.metalType === liveRate.metalType && mr.purity === liveRate.purity
            );

            return {
                metalType: liveRate.metalType,
                purity: liveRate.purity,
                liveRate: liveRate.ratePerGram,
                metalRate: metalRate?.ratePerGram || 0,
                difference: liveRate.ratePerGram - (metalRate?.ratePerGram || 0)
            };
        });

        return {
            liveRates,
            metalRates,
            differences
        };
    }

    // Get rates by metal type
    async getRatesByMetalType(metalType: 'gold' | 'silver'): Promise<ILiveRate[]> {
        return await LiveRate.find({
            metalType,
            isActive: true
        }).sort({ purity: 1 });
    }

    // Get latest rate update timestamp
    async getLastUpdateTime(): Promise<Date | null> {
        const latestRate = await LiveRate.findOne({ isActive: true })
            .sort({ lastUpdated: -1 });

        return latestRate ? latestRate.lastUpdated : null;
    }

    // Check if rates need update (if older than 1 hour)
    async needsUpdate(): Promise<boolean> {
        const lastUpdate = await this.getLastUpdateTime();
        if (!lastUpdate) return true;

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return lastUpdate < oneHourAgo;
    }
}

export const liveRateService = new LiveRateService();