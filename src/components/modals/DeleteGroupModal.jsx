import React from 'react';

const DeleteGroupModal = ({
  isOpen,
  onClose,
  onDelete,
  agreeToDelete,
  setAgreeToDelete
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[300px]">
        <h2 className="text-xl font-bold mb-4 text-center">Delete Group</h2>
        <p className="mb-4 text-start">Are you sure you want to delete this group? This action cannot be undone.</p>
        <div className="mb-4 flex items-center justify-start">
          <input
            type="checkbox"
            id="agreeToDelete"
            checked={agreeToDelete}
            onChange={(e) => setAgreeToDelete(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="agreeToDelete">I agree</label>
        </div>
        <div className="flex justify-between mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            disabled={!agreeToDelete}
            className={`px-4 py-2 rounded-lg transition ${agreeToDelete ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteGroupModal;