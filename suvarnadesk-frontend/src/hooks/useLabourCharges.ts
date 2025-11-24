import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";

export interface LabourCharge {
    _id: string;
    name: string;
    chargeType: "perGram" | "fixedPerItem";
    amount: number;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLabourChargeInput {
    name: string;
    chargeType: "perGram" | "fixedPerItem";
    amount: number;
    description?: string;
    isActive: boolean;
}

export const useLabourCharges = () => {
    return useQuery({
        queryKey: ["labourCharges"],
        queryFn: async (): Promise<LabourCharge[]> => {
            const response = await apiClient.get("/labour-charges");
            return response.data;
        },
    });
};

export const useCreateLabourCharge = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateLabourChargeInput): Promise<LabourCharge> => {
            const response = await apiClient.post("/labour-charges", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["labourCharges"] });
        },
    });
};