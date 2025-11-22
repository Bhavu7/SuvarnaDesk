import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";

export interface MetalRate {
    _id: string;
    metalType: "gold" | "silver";
    purity: string;
    ratePerGram: number;
    effectiveFrom: string | Date;
    source: "manual" | "api";
    isActive: boolean;
}

export const useMetalRates = () =>
    useQuery<MetalRate[], Error>(
        ["metalRates"],
        () => apiClient.get("/metal-rates").then(res => res.data)
    );

export const useUpdateMetalRate = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, MetalRate>(
        (data) => apiClient.post("/metal-rates", data).then(res => res.data),
        {
            onSuccess: () => queryClient.invalidateQueries(["metalRates"]),
        }
    );
};
