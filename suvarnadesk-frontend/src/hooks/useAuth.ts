import { useMutation } from "@tanstack/react-query";
import apiClient from "../api/apiClient";

interface LoginData {
    email: string;
    password: string;
}

interface Admin {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
}

interface LoginResponse {
    token: string;
    admin: Admin;
}

export const useLogin = () => {
    return useMutation<LoginResponse, Error, LoginData>({
        mutationFn: (data: LoginData) => apiClient.post("/admin/login", data).then(res => res.data)
    });
};