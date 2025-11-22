import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";

export interface Customer {
    _id: string;
    name: string;
    phone: string;
    address: string;
    shopName?: string;
    GSTNumber?: string;
    notes?: string;
}

export const useCustomers = () =>
    useQuery<Customer[], Error>({
        queryKey: ["customers"],
        queryFn: () => apiClient.get("/customers").then(res => res.data),
    });

export const useCreateCustomer = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, Customer>({
        mutationFn: (data: Customer) => apiClient.post("/customers", data).then(res => res.data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
    });
};
