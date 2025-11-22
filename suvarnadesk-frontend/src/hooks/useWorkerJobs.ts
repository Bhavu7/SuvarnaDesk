import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";

export interface WorkerJobInput {
    jobNumber?: string;
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    jobType: "repair" | "modification" | "custom";
    description: string;
    metalType: string;
    purity?: string;
    estimatedWeightBefore: { value: number; unit: string };
    estimatedWeightAfter: { value: number; unit: string };
    receivedDate: string;
    promisedDeliveryDate: string;
    actualDeliveryDate?: string;
    status: "received" | "inProgress" | "ready" | "delivered" | "cancelled";
    estimatedCharges: number;
    finalCharges?: number;
    labourChargesDetail?: any;
    paymentStatus: "unpaid" | "partial" | "paid";
    notes?: string;
    attachments?: string[];
}

export interface WorkerJob extends WorkerJobInput {
    _id: string;
}

export const useWorkerJobs = () =>
    useQuery<WorkerJob[], Error>({
        queryKey: ["workerJobs"],
        queryFn: () => apiClient.get("/worker-jobs").then((res) => res.data),
    });

export const useCreateWorkerJob = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, WorkerJobInput>({
        mutationFn: (data: WorkerJobInput) =>
            apiClient.post("/worker-jobs", data).then((res) => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workerJobs"] });
        },
    });
};
