import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";

export interface LineItem {
    itemType: "gold" | "silver" | "other";
    purity: string;
    description: string;
    weight: { value: number; unit: string };
    ratePerGram: number;
    labourChargeReferenceId?: string;
    labourChargeType?: "perGram" | "fixed" | null;
    labourChargeAmount: number;
    makingChargesTotal: number;
    otherCharges: number;
    itemTotal: number;
}

// In ../hooks/useBilling.ts
export interface InvoiceInput {
    invoiceNumber: string;
    date: string;
    customerId: string;
    customerSnapshot: {
        name: string;
        email?: string;
        phone: string;
        address?: string;
        huid?: string;
    };
    lineItems: LineItem[];
    totals: {
        subtotal: number;
        CGSTPercent: number;
        CGSTAmount: number;
        SGSTPercent: number;
        SGSTAmount: number;
        grandTotal: number;
    };
    paymentDetails: {
        paymentMode: string;
        amountPaid: number;
        balanceDue: number;
    };
    QRCodeData?: string;
}

export interface Invoice {
    _id: string;
    invoiceNumber: string;
    date: string;
    customerId: string;
    customerSnapshot: {
        name: string;
        email?: string;
        phone: string;
        address?: string;
        huid?: string;
    };
    lineItems: LineItem[];
    totals: {
        subtotal: number;
        CGSTPercent: number;
        CGSTAmount: number;
        SGSTPercent: number;
        SGSTAmount: number;
        grandTotal: number;
    };
    paymentDetails: {
        paymentMode: string;
        amountPaid: number;
        balanceDue: number;
    };
    QRCodeData?: string;
    createdAt: string;
    updatedAt: string;
}

export const useInvoices = () =>
    useQuery<Invoice[], Error>({
        queryKey: ["invoices"],
        queryFn: () => apiClient.get("/invoices").then(res => res.data),
    });

export const useCreateInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation<Invoice, Error, InvoiceInput>({
        mutationFn: (data) => apiClient.post("/invoices", data).then(res => res.data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
    });
};