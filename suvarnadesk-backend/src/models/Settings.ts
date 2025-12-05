import { Schema, model, Document } from "mongoose";

export interface IShopSettings extends Document {
    shopName: string;
    ownerName: string;
    goldOwnerName: string;
    silverOwnerName: string;
    address: string;
    phone: string;
    goldGstNumber?: string;
    silverGstNumber?: string;
    goldPanNumber?: string;
    silverPanNumber?: string;

    // Gold Bank Details
    goldBankName?: string;
    goldBankBranch?: string;
    goldBankIfsc?: string;
    goldBankAccountNo?: string;

    // Silver Bank Details
    silverBankName?: string;
    silverBankBranch?: string;
    silverBankIfsc?: string;
    silverBankAccountNo?: string;

    logoUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const settingsSchema = new Schema<IShopSettings>({
    shopName: { type: String, required: true },
    ownerName: { type: String, required: true },
    goldOwnerName: { type: String, default: "Jay Krushna Haribhai Soni" },
    silverOwnerName: { type: String, default: "M/s Yogeshkumar and Brothers" },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    goldGstNumber: { type: String },
    silverGstNumber: { type: String },
    goldPanNumber: { type: String },
    silverPanNumber: { type: String },

    // Gold Bank Details
    goldBankName: { type: String, default: "SardarGunj Mercantile Co. Operative Bank Ltd." },
    goldBankBranch: { type: String, default: "Anand" },
    goldBankIfsc: { type: String, default: "GSCB0USGUNJ" },
    goldBankAccountNo: { type: String, default: "802001002002303" },

    // Silver Bank Details
    silverBankName: { type: String, default: "SardarGunj Mercantile Co. Operative Bank Ltd." },
    silverBankBranch: { type: String, default: "Anand" },
    silverBankIfsc: { type: String, default: "GSCB0USGUNJ" },
    silverBankAccountNo: { type: String, default: "802001002001532" },

    logoUrl: { type: String }
}, {
    timestamps: true
});

export default model<IShopSettings>("Settings", settingsSchema);