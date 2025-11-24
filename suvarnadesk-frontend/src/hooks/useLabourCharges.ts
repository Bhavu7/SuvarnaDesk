// useLabourCharges.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";
import { use } from "react";

export interface LabourChargeInput {
    name: string;
    chargeType: "perGram" | "fixedPerItem";
    amount: number;
    description?: string;
    isActive: boolean;
}

export interface LabourCharge extends LabourChargeInput {
    _id: string;
}

export const useLabourCharges = () =>
    useQuery<LabourCharge[], Error>({
        queryKey: ["labourCharges"],
        queryFn: () => apiClient.get("/labour-charges").then(res => res.data),
    });

export const useCreateLabourCharge = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, LabourChargeInput>({
        mutationFn: (data: LabourChargeInput) =>
            apiClient.post("/labour-charges", data).then(res => res.data),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["labourCharges"] });
        },
    });
};
