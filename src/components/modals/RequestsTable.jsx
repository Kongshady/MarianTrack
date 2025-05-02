import React from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const RequestsTable = ({ requests, handleEditRequest, handleDeleteRequest, openRequestModal, groupRole }) => {
  return (
    <div className="overflow-y-auto mt-2 w-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">Requests</h3>
        {/* Restrict "Request Needs" button for System Analyst and Developer */}
        {groupRole !== "System Analyst" && groupRole !== "Developer" && (
          <button
            onClick={openRequestModal} // Trigger the modal for creating a new request
            className="bg-secondary-color text-white px-4 py-2 text-xs rounded-sm hover:bg-opacity-80 transition flex items-center gap-2"
          >
            <FaPlus /> Request Needs
          </button>
        )}
      </div>
      <table className="min-w-full bg-white text-xs">
        <thead className="sticky top-0 bg-secondary-color text-white">
          <tr>
            <th className="py-2 font-medium px-4">Team Member</th>
            <th className="py-2 font-medium px-4">Request Type</th>
            <th className="py-2 font-medium px-4">Date Entry</th>
            <th className="py-2 font-medium px-4">Date Needed</th>
            <th className="py-2 font-medium px-4">Resource/Tool Needed</th>
            <th className="py-2 font-medium px-4">Prospect Resource Person</th>
            <th className="py-2 font-medium px-4">Priority Level</th>
            <th className="py-2 font-medium px-4">Status</th>
            <th className="py-2 font-medium px-4">Remarks</th>
            {/* Conditionally render the Actions column */}
            {groupRole !== "System Analyst" && groupRole !== "Developer" && (
              <th className="py-2 px-4">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {requests.length > 0 ? (
            [...requests]
              .sort((a, b) => {
                const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
                if (a.status === "Done" && b.status !== "Done") return 1;
                if (a.status !== "Done" && b.status === "Done") return -1;
                if (priorityOrder[a.priorityLevel] !== priorityOrder[b.priorityLevel]) {
                  return priorityOrder[a.priorityLevel] - priorityOrder[b.priorityLevel];
                }
                return new Date(a.dateEntry) - new Date(b.dateEntry);
              })
              .map((request, index) => (
                <tr
                  key={request.id}
                  className={`${
                    request.status === "Done" ? "bg-gray-200 opacity-70" : index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="py-2 px-4">{request.responsibleTeamMember}</td>
                  <td className="py-2 px-4">{request.requestType}</td>
                  <td className="py-2 px-4">
                    {request.dateEntry
                      ? new Date(request.dateEntry.seconds * 1000).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="py-2 px-4">{request.dateNeeded}</td>
                  <td className="py-2 px-4">{request.resourceToolNeeded}</td>
                  <td className="py-2 px-4">{request.prospectResourcePerson}</td>
                  <td
                    className={`p-2 font-bold ${
                      request.priorityLevel === "HIGH"
                        ? "text-red-500"
                        : request.priorityLevel === "MEDIUM"
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                  >
                    {request.priorityLevel}
                  </td>
                  <td className="py-2 px-4 font-bold text-secondary-color">{request.status}</td>
                  <td className="py-2 px-4">{request.remarks || "N/A"}</td>
                  {/* Conditionally render the Actions buttons */}
                  {groupRole !== "System Analyst" && groupRole !== "Developer" && (
                    <td className="py-2 px-4 flex flex-wrap gap-1 items-center justify-center">
                      <button
                        onClick={() => handleEditRequest(request.id)}
                        className="bg-secondary-color text-white px-2 py-1 rounded-sm hover:bg-opacity-80 transition"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(request.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded-sm hover:bg-opacity-80 transition ml-2"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  )}
                </tr>
              ))
          ) : (
            <tr>
              <td className="py-2 px-4 text-center" colSpan={groupRole !== "System Analyst" && groupRole !== "Developer" ? 10 : 9}>
                No requests found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RequestsTable;