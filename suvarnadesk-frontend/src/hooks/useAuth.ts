import { useMutation } from "@tanstack/react-query";
import apiClient from "../api/apiClient";

interface LoginData {
    email: string;
    password: string;
}

interface LoginResponse {
    token: string;
    // Add more fields if backend returns more data
}

export const useLogin = () => {
    return useMutation<LoginResponse, Error, LoginData>(
        (data) => apiClient.post("/admin/login", data).then(res => res.data)
    );
};
