import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";

export const useCustomers = () =>
    useQuery(["customers"], () => apiClient.get("/customers").then(res => res.data));

export const useCreateCustomer = () => {
    const queryClient = useQueryClient();
    return useMutation(
        (data: any) => apiClient.post("/customers", data),
        {
            onSuccess: () => queryClient.invalidateQueries(["customers"]),
        }
    );
};
