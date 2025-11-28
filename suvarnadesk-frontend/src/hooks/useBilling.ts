import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export interface LineItem {
    itemType: "gold" | "silver" | "other";
    purity: string;
    description: string;
    weight: { value: number; unit: string };
    ratePerGram: number;
    labourChargeReferenceId: string;
    labourChargeType: "perGram" | "fixed" | null;
    labourChargeAmount: number;
    makingChargesTotal: number;
    itemTotal: number;
}

export interface InvoiceData {
    invoiceNumber: string;
    date: string;
    customerId: string;
    customerSnapshot: {
        name: string;
        email: string;
        phone: string;
        address: string;
    };
    lineItems: LineItem[];
    totals: {
        subtotal: number;
        GSTPercent: number;
        GSTAmount: number;
        grandTotal: number;
    };
    paymentDetails: {
        paymentMode: string;
        amountPaid: number;
        balanceDue: number;
    };
    QRCodeData: string;
}

export interface CreateInvoiceResponse {
    success: boolean;
    invoice: InvoiceData;
    message: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

export const useCreateInvoice = () => {
    const queryClient = useQueryClient();

    return useMutation<CreateInvoiceResponse, Error, InvoiceData>({
        mutationFn: async (invoiceData: InvoiceData) => {
            const response = await axios.post(`${API_BASE_URL}/invoices`, invoiceData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
        },
        onError: (error: any) => {
            console.error("Error creating invoice:", error);
            throw error;
        },
    });
};