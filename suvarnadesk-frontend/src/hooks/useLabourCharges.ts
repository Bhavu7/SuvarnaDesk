import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";

export interface LabourCharge {
    _id: string;
    name: string;
    chargeType: "perGram" | "fixedPerItem";
    amount: number;
    description?: string;
    isActive: boolean;
}

export const useLabourCharges = () =>
    useQuery<LabourCharge[], Error>(
        ["labourCharges"],
        () => apiClient.get("/labour-charges").then(res => res.data)
    );

export const useCreateLabourCharge = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, LabourCharge>(
        (data) => apiClient.post("/labour-charges", data).then(res => res.data),
        {
            onSuccess: () => queryClient.invalidateQueries(["labourCharges"]),
        }
    );
};
