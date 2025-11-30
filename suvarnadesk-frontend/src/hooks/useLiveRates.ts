// hooks/useLiveRates.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';

export interface LiveRate {
    _id: string;
    metalType: 'gold' | 'silver';
    purity: string;
    ratePerGram: number;
    source: 'manual' | 'api';
    lastUpdated: string;
    isActive: boolean;
}

export function useLiveRates() {
    return useQuery({
        queryKey: ['liveRates'],
        queryFn: async () => {
            const response = await apiClient.get('/live-rates');
            return response.data as LiveRate[];
        },
        refetchInterval: 300000, // Refetch every 5 minutes
        staleTime: 300000, // Consider data stale after 5 minutes
    });
}

export function useUpdateLiveRate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (rateData: {
            metalType: string;
            purity: string;
            ratePerGram: number;
        }) => {
            const response = await apiClient.post('/live-rates', rateData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['liveRates'] });
        },
    });
}