import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import axios from "axios";
import { toast } from "react-toastify";

const WorkerApproval = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [approvedWorkers, setApprovedWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  // Selection states
  const [selectedPending, setSelectedPending] = useState([]);
  const [selectedApproved, setSelectedApproved] = useState([]);

  // Fetch pending workers
  const getPendingWorkers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        backendUrl + "/api/admin/pending-workers",
        {
          headers: { aToken },
        },
      );
      if (data.success) setPendingWorkers(data.workers);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedPending.length === 0)
      return toast.warn("Select workers to approve.");
    if (
      !window.confirm(`Approve ${selectedPending.length} selected worker(s)?`)
    )
      return;

    for (const workerId of selectedPending) {
      const worker = pendingWorkers.find((w) => w._id === workerId);
      await approveWorker(workerId, worker?.name || "Worker");
    }

    toast.success("Selected workers approved successfully!");
    setSelectedPending([]);
    getPendingWorkers();
    getApprovedWorkers();
  };

  // Fetch approved workers
  const getApprovedWorkers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        backendUrl + "/api/admin/approved-workers",
        {
          headers: { aToken },
        },
      );
      if (data.success) setApprovedWorkers(data.workers);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Approve worker
  const approveWorker = async (workerId, workerName) => {
    if (!window.confirm(`Approve ${workerName}?`)) return;
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/update-worker-status",
        { workerId, isApproved: true },
        { headers: { aToken } },
      );
      if (data.success) {
        toast.success(data.message);
        getPendingWorkers();
        getApprovedWorkers();
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Reject single worker
  const rejectWorker = async (workerId, workerName) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/update-worker-status",
        { workerId, isApproved: false },
        { headers: { aToken } },
      );
      if (data.success) {
        toast.success(`Rejected: ${workerName}`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Delete single worker
  const deleteWorker = async (workerId, workerName) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/delete-worker",
        { workerId },
        { headers: { aToken } },
      );
      if (data.success) {
        toast.success(`Deleted: ${workerName}`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleBulkReject = async () => {
    if (selectedPending.length === 0)
      return toast.warn("Select workers to reject.");
    if (!window.confirm(`Reject ${selectedPending.length} selected worker(s)?`))
      return;

    for (const workerId of selectedPending) {
      const worker = pendingWorkers.find((w) => w._id === workerId);
      await rejectWorker(workerId, worker?.name || "Worker");
    }

    toast.success("Selected workers rejected successfully!");
    setSelectedPending([]);
    getPendingWorkers();
    getApprovedWorkers();
  };

  const handleBulkDelete = async () => {
    if (selectedApproved.length === 0)
      return toast.warn("Select workers to delete.");
    if (
      !window.confirm(`Delete ${selectedApproved.length} selected worker(s)?`)
    )
      return;

    for (const workerId of selectedApproved) {
      const worker = approvedWorkers.find((w) => w._id === workerId);
      await deleteWorker(workerId, worker?.name || "Worker");
    }

    toast.success("Selected workers deleted successfully!");
    setSelectedApproved([]);
    getApprovedWorkers();
  };

  // Selection handlers
  const toggleSelectAll = (type, e) => {
    if (type === "pending") {
      e.target.checked
        ? setSelectedPending(pendingWorkers.map((w) => w._id))
        : setSelectedPending([]);
    } else {
      e.target.checked
        ? setSelectedApproved(approvedWorkers.map((w) => w._id))
        : setSelectedApproved([]);
    }
  };

  const toggleSelectOne = (type, id) => {
    if (type === "pending") {
      setSelectedPending((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    } else {
      setSelectedApproved((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    }
  };

  useEffect(() => {
    if (aToken) {
      getPendingWorkers();
      getApprovedWorkers();
    }
  }, [aToken]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Worker Management
          </h1>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex sm:justify-center lg:justify-end">
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "pending"
                  ? "bg-[#3a8dff] text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Pending Workers ({pendingWorkers.length})
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "approved"
                  ? "bg-[#3a8dff] text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Approved Workers ({approvedWorkers.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3a8dff]"></div>
          </div>
        ) : (
          <>
            {/*  Pending Workers */}
            {/* Pending Workers */}
            {activeTab === "pending" && (
              <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Pending Workers
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleBulkApprove}
                      className="px-4 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition"
                    >
                      Approve Selected
                    </button>
                    <button
                      onClick={handleBulkReject}
                      className="px-4 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition"
                    >
                      Reject Selected
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-center">
                          <input
                            type="checkbox"
                            onChange={(e) => toggleSelectAll("pending", e)}
                            checked={
                              pendingWorkers.length > 0 &&
                              selectedPending.length === pendingWorkers.length
                            }
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Worker ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          CNIC
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Application Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingWorkers.length > 0 ? (
                        pendingWorkers.map((worker) => (
                          <tr
                            key={worker._id}
                            className={`hover:bg-yellow-50 ${
                              selectedPending.includes(worker._id)
                                ? "bg-red-50"
                                : ""
                            }`}
                          >
                            <td className="px-6 py-4 text-center">
                              <input
                                type="checkbox"
                                checked={selectedPending.includes(worker._id)}
                                onChange={() =>
                                  toggleSelectOne("pending", worker._id)
                                }
                              />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {worker._id}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {worker.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {worker.email}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {worker.phoneNumber}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {worker.cnic}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(worker.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center py-8 text-gray-500"
                          >
                            No pending worker requests.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/*  Approved Workers */}
            {activeTab === "approved" && (
              <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Approved Workers
                  </h2>
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition"
                  >
                    Delete Selected
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-center">
                          <input
                            type="checkbox"
                            onChange={(e) => toggleSelectAll("approved", e)}
                            checked={
                              approvedWorkers.length > 0 &&
                              selectedApproved.length === approvedWorkers.length
                            }
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          CNIC
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Work ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Joined Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {approvedWorkers.length > 0 ? (
                        approvedWorkers.map((worker) => (
                          <tr
                            key={worker._id}
                            className={`hover:bg-green-50 ${
                              selectedApproved.includes(worker._id)
                                ? "bg-red-50"
                                : ""
                            }`}
                          >
                            <td className="px-6 py-4 text-center">
                              <input
                                type="checkbox"
                                checked={selectedApproved.includes(worker._id)}
                                onChange={() =>
                                  toggleSelectOne("approved", worker._id)
                                }
                              />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {worker._id}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {worker.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {worker.email}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {worker.phoneNumber}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {worker.cnic}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {worker.workerID ? worker.workerID : "N/A"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(worker.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="8"
                            className="text-center py-8 text-gray-500"
                          >
                            No active approved workers found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WorkerApproval;
