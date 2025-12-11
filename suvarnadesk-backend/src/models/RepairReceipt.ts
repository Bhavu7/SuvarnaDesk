import mongoose, { Schema, Document } from 'mongoose';

export interface IRepairItem {
    description: string;
    quantity: number;
    unitPrice: number;
    weight?: number;
    itemType?: 'gold' | 'silver' | 'other';
}

export interface IRepairReceipt extends Document {
    receiptNumber: string;
    receiptDateTime: Date;
    paymentMethod: string;
    customerName: string;
    customerAddress: string;
    companyName: string;
    companyAddress: string;
    items: IRepairItem[];
    salespersonName: string;
    tax: number;
    subtotal: number;
    taxAmount: number;
    total: number;
    shopSettings?: {
        shopName?: string;
        address?: string;
        phone?: string;
        email?: string;
        panNumber?: string;
        gstNumber?: string;
        goldOwnerName?: string;
        goldGstNumber?: string;
        goldPanNumber?: string;
        silverOwnerName?: string;
        silverGstNumber?: string;
        silverPanNumber?: string;
        bankName?: string;
        bankBranch?: string;
        bankIfsc?: string;
        bankAccountNo?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const RepairReceiptSchema = new Schema({
    receiptNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    receiptDateTime: {
        type: Date,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['cash', 'card', 'cheque', 'upi', 'bank_transfer']
    },
    customerName: {
        type: String,
        required: true
    },
    customerAddress: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    companyAddress: {
        type: String,
        required: true
    },
    items: [{
        description: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unitPrice: {
            type: Number,
            required: true,
            min: 0
        },
        weight: {
            type: Number,
            default: 0
        },
        itemType: {
            type: String,
            enum: ['gold', 'silver', 'other'],
            default: 'other'
        }
    }],
    salespersonName: {
        type: String,
        required: true
    },
    tax: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    subtotal: {
        type: Number,
        required: true
    },
    taxAmount: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    shopSettings: {
        type: Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
RepairReceiptSchema.index({ receiptDateTime: -1 });
RepairReceiptSchema.index({ customerName: 1 });
RepairReceiptSchema.index({ 'items.itemType': 1 });

export default mongoose.model<IRepairReceipt>('RepairReceipt', RepairReceiptSchema);