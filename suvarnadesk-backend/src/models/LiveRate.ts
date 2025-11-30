// models/LiveRate.ts
import { Schema, model, Document } from 'mongoose';

export interface ILiveRateDocument extends Document {
    metalType: 'gold' | 'silver';
    purity: string;
    ratePerGram: number;
    source: 'manual' | 'api';
    lastUpdated: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const liveRateSchema = new Schema<ILiveRateDocument>({
    metalType: {
        type: String,
        enum: ['gold', 'silver'],
        required: true
    },
    purity: {
        type: String,
        required: true
    },
    ratePerGram: {
        type: Number,
        required: true
    },
    source: {
        type: String,
        enum: ['manual', 'api'],
        default: 'manual'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound index to ensure unique active rates for metalType and purity
liveRateSchema.index({ metalType: 1, purity: 1, isActive: 1 }, {
    unique: true,
    partialFilterExpression: { isActive: true }
});

export const LiveRate = model<ILiveRateDocument>('LiveRate', liveRateSchema);