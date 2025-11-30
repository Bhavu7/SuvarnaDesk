// src/hooks/useMetalRates.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';

export interface MetalRate {
    _id: string;
    metalType: "gold" | "silver";
    purity: string;
    ratePerGram: number;
    effectiveFrom: Date;
    source: string;
    isActive: boolean;
}

export function useMetalRates() {
    return useQuery({
        queryKey: ['metalRates'],
        queryFn: async () => {
            const response = await apiClient.get('/metal-rates');
            return response.data as MetalRate[];
        },
    });
}

export function useCreateMetalRate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (rateData: Omit<MetalRate, '_id'>) => {
            const response = await apiClient.post('/metal-rates', rateData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['metalRates'] });
        },
    });
}

export function useUpdateMetalRate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<MetalRate> }) => {
            const response = await apiClient.put(`/metal-rates/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['metalRates'] });
        },
    });
}