// hooks/useBilling.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';

export interface LineItem {
    itemType: "gold" | "silver" | "other";
    purity: string;
    description: string;
    weight: { value: number; unit: string };
    ratePerGram: number;
    labourChargeReferenceId: string;
    labourChargeType: 'perGram' | 'fixed' | null;
    labourChargeAmount: number;
    makingChargesTotal: number;
    otherCharges: number;
    itemTotal: number;
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
        totalGST: number;
        grandTotal: number;
    };
    paymentDetails: {
        paymentMode: string;
        amountPaid: number;
        balanceDue: number;
    };
    QRCodeData: string;
    pdfData: any[];
    ratesSource: 'live' | 'manual';
    createdAt: Date;
    updatedAt: Date;
}

// Create a type for the invoice payload without the auto-generated fields
export type CreateInvoicePayload = Omit<Invoice, '_id' | 'createdAt' | 'updatedAt'>;

export function useCreateInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (invoiceData: CreateInvoicePayload) => {
            const response = await apiClient.post('/invoices', invoiceData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
    });
}

export function useInvoices() {
    return useQuery({
        queryKey: ['invoices'],
        queryFn: async () => {
            const response = await apiClient.get('/invoices');
            return response.data as Invoice[];
        },
    });
}

export function useInvoice(id: string) {
    return useQuery({
        queryKey: ['invoice', id],
        queryFn: async () => {
            const response = await apiClient.get(`/invoices/${id}`);
            return response.data as Invoice;
        },
        enabled: !!id,
    });
}