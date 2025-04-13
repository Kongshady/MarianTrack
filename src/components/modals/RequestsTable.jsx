import React from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const RequestsTable = ({ requests, handleEditRequest, handleDeleteRequest, openRequestModal, userRole }) => {
  return (
    <div className="overflow-y-auto h-96 mt-2 w-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">Requests</h3>
        {userRole === "Project Manager" && (
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
            {userRole === "Project Manager" && <th className="py-2 px-4">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {requests.length > 0 ? (
            requests.map((request, index) => (
              <tr key={request.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
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
                <td className="py-2 px-4">{request.priorityLevel}</td>
                <td className="py-2 px-4 font-bold text-secondary-color">{request.status}</td>
                {userRole === "Project Manager" && (
                  <td className="py-2 px-4">
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
              <td className="py-2 px-4 text-center" colSpan={userRole === "Project Manager" ? 9 : 8}>
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