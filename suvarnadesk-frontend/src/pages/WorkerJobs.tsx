import React, { useState } from "react";
import { useWorkerJobs, useCreateWorkerJob } from "../hooks/useWorkerJobs";

export default function WorkerJobs() {
  const { data: jobs, isLoading } = useWorkerJobs();
  const createJobMutation = useCreateWorkerJob();

  const [description, setDescription] = useState("");
  // form fields for job creation omitted for brevity

  const handleAddJob = () => {
    // collect form data and submit
    // example minimal:
    createJobMutation.mutate({
      description,
      jobType: "repair",
      status: "received",
      estimatedCharges: 0,
      paymentStatus: "unpaid",
    });
  };

  if (isLoading) return <div>Loading jobs...</div>;

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-4">Worker Jobs</h1>
      <div>
        {/* List jobs */}
        {jobs?.map((job: any) => (
          <div key={job._id} className="border p-2 my-2 rounded">
            #{job.jobNumber} - {job.description} - Status: {job.status}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Add New Job</h2>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded w-full mb-2"
          placeholder="Description"
        />
        <button
          onClick={handleAddJob}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Job
        </button>
      </div>
    </div>
  );
}
