import { useMutation } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { setToken, removeToken } from '../utils/auth';

interface LoginData {
    email: string;
    password: string;
}

export const useLogin = () => {
    return useMutation(
        (data: LoginData) => apiClient.post('/admin/login', data),
        {
            onSuccess: (res) => {
                setToken(res.data.token);
            },
        }
    );
};

export const useLogout = () => {
    return () => {
        removeToken();
        window.location.href = '/login';
    };
};
