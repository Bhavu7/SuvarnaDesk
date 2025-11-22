import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";

export const useLabourCharges = () =>
    useQuery(["labourCharges"], () => apiClient.get("/labour-charges").then(res => res.data));

export const useCreateLabourCharge = () => {
    const queryClient = useQueryClient();
    return useMutation(
        (data: any) => apiClient.post("/labour-charges", data),
        {
            onSuccess: () => queryClient.invalidateQueries(["labourCharges"]),
        }
    );
};
