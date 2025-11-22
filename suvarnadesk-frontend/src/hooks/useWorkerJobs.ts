import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";

export interface WorkerJob {
    _id: string;
    jobNumber: string;
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

export const useWorkerJobs = () =>
    useQuery<WorkerJob[], Error>(
        ["workerJobs"],
        () => apiClient.get("/worker-jobs").then(res => res.data)
    );

export const useCreateWorkerJob = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, WorkerJob>(
        (data) => apiClient.post("/worker-jobs", data).then(res => res.data),
        {
            onSuccess: () => queryClient.invalidateQueries(["workerJobs"]),
        }
    );
};
