import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";

export const useWorkerJobs = () =>
    useQuery(["workerJobs"], () => apiClient.get("/worker-jobs").then(res => res.data));

export const useCreateWorkerJob = () => {
    const queryClient = useQueryClient();
    return useMutation(
        (data: any) => apiClient.post("/worker-jobs", data),
        {
            onSuccess: () => queryClient.invalidateQueries(["workerJobs"]),
        }
    );
};
