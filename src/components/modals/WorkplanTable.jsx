import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { db } from "../../config/marian-config"; // Import Firestore configuration
import { addDoc, collection, serverTimestamp } from "firebase/firestore"; // Import Firestore methods

const WorkplanTable = ({ workplan, groupMembers, handleAddTask, handleEditTask, handleDeleteTask, handleUpdateStatus, groupRole }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskData, setTaskData] = useState({
    taskName: "",
    assignedTo: "",
    startDate: "",
    endDate: "",
    priorityLevel: "Low", // Default priority level
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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
        priorityLevel: "Low", // Reset priority level
      });
    }
  };

  const openEditModal = (task) => {
    setTaskData(task);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const notifyAssignedMember = async (task) => {
    try {
      // Find the assigned member
      const assignedMember = groupMembers.find(
        (member) => `${member.name} ${member.lastname}` === task.assignedTo
      );

      if (assignedMember) {
        // Create a notification for the assigned member
        await addDoc(collection(db, "notifications"), {
          userId: assignedMember.id, // ID of the assigned member
          message: `<b style="color:red">Task Update:</b> Your task <b>${task.taskName}</b> has been marked as <b style="color:green">Completed</b> by your Project Manager.`,
          createdAt: serverTimestamp(), // Use Firestore's serverTimestamp
          read: false,
          type: "task-status",
          groupId: task.groupId,
        });
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // Update the task status
      await handleUpdateStatus(taskId, newStatus);

      // Check if the new status is "Completed"
      if (newStatus === "Completed") {
        const task = workplan.find((task) => task.id === taskId);
        if (task) {
          await notifyAssignedMember(task); // Notify the assigned member
        }
      }
    } catch (error) {
      console.error("Error updating task status or sending notification:", error);
    }
  };

  return (
    <div className="mt-2 w-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">Workplan</h3>
        {groupRole !== "System Analyst" && groupRole !== "Developer" && (
          <button
            onClick={() => {
              setTaskData({
                taskName: "",
                assignedTo: "",
                startDate: "",
                endDate: "",
                priorityLevel: "Low", // Default priority level
              });
              setIsEditing(false);
              setIsModalOpen(true);
            }}
            className="bg-secondary-color text-white px-4 py-2 text-xs rounded-sm hover:bg-opacity-80 transition flex items-center gap-2"
          >
            + Add Task
          </button>
        )}
      </div>
      <table className="min-w-full bg-white text-xs">
        <thead className="sticky top-0 bg-secondary-color text-white">
          <tr>
            <th className="py-2 px-4 font-medium text-left">Task Name</th>
            <th className="py-2 px-4 font-medium text-right">Assigned Member</th>
            <th className="py-2 px-4 font-medium">Start Date</th>
            <th className="py-2 px-4 font-medium">End Date</th>
            <th className="py-2 px-4 font-medium">Priority Level</th>
            <th className="py-2 px-4 font-medium">Status</th>
            <th className="py-2 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {workplan.length > 0 ? (
            // Sort tasks by priority level (High > Medium > Low) and then by status (Completed at the bottom)
            [...workplan]
              .sort((a, b) => {
                const priorityOrder = { High: 1, Medium: 2, Low: 3 };
                if (a.status === "Completed" && b.status !== "Completed") return 1;
                if (a.status !== "Completed" && b.status === "Completed") return -1;
                if (priorityOrder[a.priorityLevel] !== priorityOrder[b.priorityLevel]) {
                  return priorityOrder[a.priorityLevel] - priorityOrder[b.priorityLevel];
                }
                return new Date(a.startDate) - new Date(b.startDate);
              })
              .map((task, index) => (
                <tr
                  key={task.id}
                  className={`${task.status === "Completed" ? "bg-gray-200 opacity-70" : index % 2 === 0 ? "bg-white" : "bg-gray-100"
                    }`}
                >
                  <td className="p-1 text-left">{task.taskName}</td>
                  <td className="p-1 text-right">{task.assignedTo}</td>
                  <td className="p-1">
                    {new Date(task.startDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="p-1">
                    {new Date(task.endDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td
                    className={`p-2 font-bold ${task.priorityLevel === "High"
                        ? "text-red-500"
                        : task.priorityLevel === "Medium"
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}
                  >
                    {task.priorityLevel}
                  </td>
                  <td className="p-1">
                    {/* Allow only Project Manager or Assigned Member to edit the status */}
                    {groupRole === "Project Manager" || task.assignedTo === groupMembers.find((member) => member.name === task.assignedTo)?.name ? (
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="w-full p-1 border text-xs text-center"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                      </select>
                    ) : (
                      <span className="text-xs">{task.status}</span>
                    )}
                  </td>
                  <td className="p-1 flex justify-center gap-2">
                    {/* Restrict actions for System Analyst and Developer */}
                    {groupRole !== "System Analyst" && groupRole !== "Developer" && (
                      <>
                        <button
                          onClick={() => openEditModal(task)}
                          className="bg-secondary-color text-white px-2 py-1 rounded-sm hover:bg-opacity-80 transition"
                          disabled={task.status === "Completed"} // Disable edit for completed tasks
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded-sm hover:bg-opacity-80 transition"
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
          ) : (
            <tr>
              <td className="p-1 text-center" colSpan="7">
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
              <div className="col-span-2">
                <label className="block text-sm">Priority Level</label>
                <select
                  name="priorityLevel"
                  value={taskData.priorityLevel}
                  onChange={handleInputChange}
                  className="w-full p-2 border text-sm"
                  required
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
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