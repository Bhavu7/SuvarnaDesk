import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";

export interface Product {
    _id?: string;
    productNo: string;
    name: string;
    productType: "gold" | "silver";
    quantity: number;
    hsnCode: string;
    weight: number;
    weightUnit: "g" | "mg" | "kg" | "tola";
}

export const useProducts = () =>
    useQuery<Product[], Error>({
        queryKey: ["products"],
        queryFn: async () => {
            const { data } = await apiClient.get("/products");
            return data;
        },
    });

export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: Product) => apiClient.post("/products", payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Product }) =>
            apiClient.put(`/products/${id}`, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiClient.delete(`/products/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};