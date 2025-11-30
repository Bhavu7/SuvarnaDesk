// types/liveRate.ts
export interface ILiveRate {
    _id?: string;
    metalType: 'gold' | 'silver';
    purity: string;
    ratePerGram: number;
    source: 'manual' | 'api';
    lastUpdated: Date;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ILiveRateInput {
    metalType: 'gold' | 'silver';
    purity: string;
    ratePerGram: number;
    source?: 'manual' | 'api';
}

export interface IBulkRateInput {
    rates: ILiveRateInput[];
}

export interface IExternalRateSource {
    metalType: 'gold' | 'silver';
    purity: string;
    ratePerGram: number;
}

export interface IRateHistoryQuery {
    days?: number;
}