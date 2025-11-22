import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";

export const useMetalRates = () =>
    useQuery(["metalRates"], () => apiClient.get("/metal-rates").then(res => res.data));

export const useUpdateMetalRate = () => {
    const queryClient = useQueryClient();
    return useMutation(
        (data: any) => apiClient.post("/metal-rates", data),
        {
            onSuccess: () => queryClient.invalidateQueries(["metalRates"]),
        }
    );
};
