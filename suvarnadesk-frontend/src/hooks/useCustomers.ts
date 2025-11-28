// hooks/useCustomers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";
import { useMemo } from "react";

export interface Customer {
    _id: string;
    name: string;
    phone: string;
    address: string;
    shopName?: string;
    GSTNumber?: string;
    notes?: string;
    email?: string;
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

// Add customer search hook
export const useCustomerSearch = (searchTerm: string) => {
    const { data: customers } = useCustomers();

    const filteredCustomers = useMemo(() => {
        if (!searchTerm) return customers || [];
        return (customers || []).filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm)
        );
    }, [customers, searchTerm]);

    return filteredCustomers;
};