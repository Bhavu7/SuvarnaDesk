import { UseQueryResult, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";

export interface LineItem {
    itemType: "gold" | "silver" | "other";
    description: string;
    purity: string;
    weight: { value: number; unit: string };
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
    customerSnapshot: object;
    lineItems: LineItem[];
    totals: { subtotal: number; GSTPercent: number; GSTAmount: number; grandTotal: number };
    paymentDetails: { paymentMode: string; amountPaid: number; balanceDue: number; notes?: string };
    QRCodeData?: string;
}

export const useInvoices = (): UseQueryResult<Invoice[], Error> =>
    useQuery<Invoice[], Error>({
        queryKey: ["invoices"],
        queryFn: () => apiClient.get("/invoices").then(res => res.data),
    });

export const useCreateInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, Invoice>({
        mutationFn: (data) => apiClient.post("/invoices", data).then(res => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
        },
    });
};
