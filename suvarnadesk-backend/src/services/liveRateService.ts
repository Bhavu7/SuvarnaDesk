// services/liveRateService.ts
import { LiveRate, ILiveRate } from '../models/LiveRate';
import MetalRate, { IMetalRate } from '../models/MetalRate';

export interface ILiveRateInput {
    metalType: 'gold' | 'silver';
    purity: string;
    ratePerGram: number;
    source?: 'manual' | 'api';
}

export interface IRatesSummary {
    gold: ILiveRate[];
    silver: ILiveRate[];
    lastUpdated: Date | null;
    totalRates: number;
}

export class LiveRateService {
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

    // Create or update live rate manually
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

    // Get rates summary
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
}

export const liveRateService = new LiveRateService();