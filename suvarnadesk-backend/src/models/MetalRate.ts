import mongoose, { Document, Schema } from 'mongoose';

export interface IMetalRate extends Document {
    metalType: 'gold' | 'silver';
    purity: string;
    ratePerGram: number;
    effectiveFrom: Date;
    source: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const metalRateSchema = new Schema({
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
        required: true,
        min: 0
    },
    effectiveFrom: {
        type: Date,
        required: true,
        default: Date.now
    },
    source: {
        type: String,
        default: 'manual'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound index to ensure only one active rate per metal type and purity
metalRateSchema.index({ metalType: 1, purity: 1, isActive: 1 }, {
    unique: true,
    partialFilterExpression: { isActive: true }
});

export default mongoose.model<IMetalRate>('MetalRate', metalRateSchema);