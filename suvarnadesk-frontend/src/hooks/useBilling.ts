import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";

export const useInvoices = () =>
    useQuery(["invoices"], () => apiClient.get("/invoices").then(res => res.data));

export const useCreateInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation(
        (data: any) => apiClient.post("/invoices", data),
        {
            onSuccess: () => queryClient.invalidateQueries(["invoices"]),
        }
    );
};
