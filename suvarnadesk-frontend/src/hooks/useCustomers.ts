// hooks/useCustomers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';

export interface Customer {
    _id: string;
    name: string;
    email?: string;
    phone: string;
    address?: string;
    huid?: string;
    createdAt: Date;
    updatedAt: Date;
}

export function useCustomers() {
    return useQuery({
        queryKey: ['customers'],
        queryFn: async () => {
            const response = await apiClient.get('/customers');
            return response.data as Customer[];
        },
    });
}

export function useCreateCustomer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (customerData: Omit<Customer, '_id' | 'createdAt' | 'updatedAt'>) => {
            const response = await apiClient.post('/customers', customerData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
    });
}

export function useUpdateCustomer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Customer> }) => {
            const response = await apiClient.put(`/customers/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
    });
}