export interface Admin {
    name: string;
    email: string;
    phone?: string;
    token?: string;
}

export interface Customer {
    _id: string;
    name: string;
    phone: string;
    address: string;
    shopName?: string;
    GSTNumber?: string;
    notes?: string;
}

export interface LineItem {
    itemType: "gold" | "silver" | "other";
    description: string;
    purity: string;
    weight: { value: number; unit: string; };
    ratePerGram: number;
    labourChargeReferenceId?: string;
    labourChargeType?: "perGram" | "fixedPerItem" | null;
    labourChargeAmount?: number;
    makingChargesTotal: number;
    itemTotal: number;
}

export interface Invoice {
    _id?: string;
    invoiceNumber: string;
    date: string;
    customerId: string;
    customerSnapshot: { name: string; phone: string; GSTNumber?: string; address: string; };
    lineItems: LineItem[];
    totals: { subtotal: number; GSTPercent: number; GSTAmount: number; grandTotal: number; };
    paymentDetails: { paymentMode: string; amountPaid: number; balanceDue: number; notes?: string; };
    QRCodeData?: string;
    createdBy?: string;
    updatedAt?: string;
}

export interface WorkerJob {
    _id?: string;
    jobNumber: string;
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    jobType: "repair" | "modification" | "custom";
    description: string;
    metalType: string;
    purity?: string;
    estimatedWeightBefore: { value: number; unit: string };
    estimatedWeightAfter: { value: number; unit: string };
    receivedDate: string;
    promisedDeliveryDate: string;
    actualDeliveryDate?: string | null;
    status: "received" | "inProgress" | "ready" | "delivered" | "cancelled";
    estimatedCharges: number;
    finalCharges?: number;
    labourChargesDetail?: any;
    paymentStatus: "unpaid" | "partial" | "paid";
    notes?: string;
    attachments?: string[];
}

export interface LabourCharge {
    _id?: string;
    name: string;
    chargeType: "perGram" | "fixedPerItem";
    amount: number;
    description?: string;
    isActive: boolean;
}

export interface MetalRate {
    _id?: string;
    metalType: "gold" | "silver";
    purity: string;
    ratePerGram: number;
    effectiveFrom: string;
    source: "manual" | "api";
    isActive: boolean;
}
