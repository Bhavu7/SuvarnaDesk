import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";

export interface MetalRateInput {
    metalType: "gold" | "silver";
    purity: string;
    ratePerGram: number;
    effectiveFrom: string | Date;
    source: "manual" | "api";
    isActive: boolean;
}

export interface MetalRate extends MetalRateInput {
    _id: string;
}

export const useMetalRates = () =>
    useQuery<MetalRate[], Error>({
        queryKey: ["metalRates"], // Use object with queryKey, not just array
        queryFn: () => apiClient.get("/metal-rates").then(res => res.data),
    });

export const useUpdateMetalRate = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, MetalRateInput>({
        mutationFn: (data: MetalRateInput) =>
            apiClient.post("/metal-rates", data).then(res => res.data),
        onSuccess: () => {
            // Pass invalidateQueries with object containing queryKey
            queryClient.invalidateQueries({ queryKey: ["metalRates"] });
        },
    });
};
