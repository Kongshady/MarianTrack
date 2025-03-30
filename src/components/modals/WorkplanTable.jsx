import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

const WorkplanTable = ({ workplan, groupMembers, handleAddTask, handleEditTask, handleDeleteTask, handleUpdateStatus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskData, setTaskData] = useState({
    taskName: "",
    assignedTo: "",
    startDate: "",
    endDate: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    // Validation for endDate
    if (name === "endDate" && new Date(value) < new Date(taskData.startDate)) {
      alert("End Date cannot be earlier than Start Date.");
      return; // Prevent the update
    }
  
    // Validation for startDate
    if (name === "startDate" && new Date(taskData.endDate) < new Date(value)) {
      alert("Start Date cannot be later than End Date.");
      return; // Prevent the update
    }
  
    setTaskData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      handleEditTask(taskData);
      setIsModalOpen(false); // Close the modal after editing
      setIsEditing(false);
    } else {
      handleAddTask(taskData);
      // Clear the inputs after adding a task
      setTaskData({
        taskName: "",
        assignedTo: "",
        startDate: "",
        endDate: "",
      });
    }
  };

  const openEditModal = (task) => {
    setTaskData(task);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  return (
    <div className="overflow-y-auto h-96 mt-2 w-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">Workplan</h3>
        <button
          onClick={() => {
            setTaskData({
              taskName: "",
              assignedTo: "",
              startDate: "",
              endDate: "",
            });
            setIsEditing(false);
            setIsModalOpen(true);
          }}
          className="bg-secondary-color text-white px-4 py-2 text-xs rounded-sm hover:bg-opacity-80 transition flex items-center gap-2"
        >
          + Add Task
        </button>
      </div>
      <table className="min-w-full bg-white border border-gray-200 text-xs">
        <thead className="sticky top-0 bg-secondary-color text-white">
          <tr>
            <th className="py-2 px-4 border-b text-left">Task Name</th>
            <th className="py-2 px-4 border-b text-right">Assigned Member</th>
            <th className="py-2 px-4 border-b">Start Date</th>
            <th className="py-2 px-4 border-b">End Date</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {workplan.length > 0 ? (
            // Sort tasks by startDate in ascending order
            [...workplan]
              .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
              .map((task) => (
                <tr key={task.id} className="text-center">
                  <td className="p-1 border-b text-left">{task.taskName}</td>
                  <td className="p-1 border-b text-right">{task.assignedTo}</td>
                  <td className="p-1 border-b">
                    {new Date(task.startDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="p-1 border-b">
                    {new Date(task.endDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="p-1 border-b">
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                      className="w-full p-1 border text-xs text-center"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td className="p-1 border-b">
                    <button
                      onClick={() => openEditModal(task)}
                      className="bg-secondary-color text-white px-2 py-1 rounded-sm hover:bg-opacity-80 transition"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded-sm hover:bg-opacity-80 transition ml-2"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
          ) : (
            <tr>
              <td className="p-1 border-b text-center" colSpan="6">
                No tasks found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[550px]">
            <h2 className="text-xl font-bold mb-4 text-center">
              {isEditing ? "Edit Task" : "Add Task"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <label className="block text-sm">Task Name</label>
                <input
                  type="text"
                  name="taskName"
                  value={taskData.taskName}
                  onChange={handleInputChange}
                  className="w-full p-2 border text-sm"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm">Assigned Member</label>
                <select
                  name="assignedTo"
                  value={taskData.assignedTo}
                  onChange={handleInputChange}
                  className="w-full p-2 border text-sm"
                  required
                >
                  <option value="">Select Member</option>
                  {groupMembers.map((member) => (
                    <option key={member.id} value={`${member.name} ${member.lastname}`}>
                      {member.name} {member.lastname}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={taskData.startDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={taskData.endDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border text-sm"
                  required
                />
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white text-sm rounded-sm hover:bg-gray-600 transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-secondary-color text-white text-sm rounded-sm hover:bg-opacity-80 transition"
                >
                  {isEditing ? "Update Task" : "Add Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkplanTable;