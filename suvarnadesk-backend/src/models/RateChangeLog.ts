import mongoose, { Schema, Document } from 'mongoose';
export interface IRateChangeLog extends Document {
    metalType: string;
    purity: string;
    oldRatePerGram: number;
    newRatePerGram: number;
    changedBy: mongoose.Types.ObjectId;
    timestamp: Date;
}
const RateChangeLogSchema: Schema = new Schema({
    metalType: { type: String, required: true },
    purity: { type: String, required: true },
    oldRatePerGram: { type: Number, required: true },
    newRatePerGram: { type: Number, required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
    timestamp: { type: Date, default: Date.now }
});
export default mongoose.model<IRateChangeLog>('RateChangeLog', RateChangeLogSchema);
