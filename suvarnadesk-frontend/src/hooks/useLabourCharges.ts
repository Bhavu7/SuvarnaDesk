// hooks/useLabourCharges.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';

export interface LabourCharge {
    _id: string;
    name: string;
    chargeType: 'perGram' | 'fixed';
    amount: number;
    isActive: boolean;
    description?: string;
}

export function useLabourCharges() {
    return useQuery({
        queryKey: ['labourCharges'],
        queryFn: async () => {
            const response = await apiClient.get('/labour-charges');
            return response.data as LabourCharge[];
        },
    });
}

export function useCreateLabourCharge() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (chargeData: Omit<LabourCharge, '_id'>) => {
            const response = await apiClient.post('/labour-charges', chargeData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['labourCharges'] });
        },
    });
}