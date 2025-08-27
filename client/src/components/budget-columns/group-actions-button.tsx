import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MdOutlineDeleteForever, MdOutlineEdit } from "react-icons/md";
import { updateGroupName, deleteGroup } from "../../api/api";
import Modal from "../modal";
import ThreeDotButton from "../three-dot-button";

type GroupActionsButtonProps = {
  groupId: string;
  groupName: string;
  projectAreaId: string;
};

export default function GroupActionsButton({
  groupId,
  groupName,
  projectAreaId
}: GroupActionsButtonProps) {
  const queryClient = useQueryClient();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editGroupName, setEditGroupName] = useState(groupName);
  const [modalErrorMessage, setModalErrorMessage] = useState<string>("");

  const updateGroupNameMutation = useMutation({
    mutationFn: updateGroupName,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["area"] });
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      setModalErrorMessage(error instanceof Error ? error.message : "Failed to update group name");
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["area"] });
      queryClient.invalidateQueries({ queryKey: ["area-cost", projectAreaId] });
      setIsDeleteModalOpen(false);
    },
    onError: (error) => {
      setModalErrorMessage(error instanceof Error ? error.message : "Failed to delete group");
    },
  });

  const actions = [
    {
      icon: <MdOutlineEdit />,
      title: "Edit Group",
      action: () => {
        setEditGroupName(groupName);
        setIsEditModalOpen(true);
      },
    },
    {
      icon: <MdOutlineDeleteForever />,
      title: "Delete Group",
      action: () => {
        setIsDeleteModalOpen(true);
      },
    },
  ];

  function toggleDropdown() {
    setIsDropdownOpen((prev) => !prev);
  }

  function handleEdit() {
    if (editGroupName.trim()) {
      updateGroupNameMutation.mutate({
        groupId,
        name: editGroupName.trim(),
      });
    }
  }

  function handleDelete() {
    deleteGroupMutation.mutate(groupId);
  }

  function renderEditModal() {
    return (
      <Modal
        isOpen={isEditModalOpen}
        onConfirm={handleEdit}
        onCancel={() => setIsEditModalOpen(false)}
        title="Edit Group Name"
        disableConfirm={!editGroupName.trim() || updateGroupNameMutation.isPending}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
              Group Name:
            </label>
            <input
              type="text"
              id="groupName"
              value={editGroupName}
              onChange={(e) => setEditGroupName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600"
              placeholder="Enter group name"
              required
            />
          </div>
          {modalErrorMessage && (
            <div className="text-rose-700">{modalErrorMessage}</div>
          )}
        </div>
      </Modal>
    );
  }

  function renderDeleteConfirmationModal() {
    return (
      <Modal
        isOpen={isDeleteModalOpen}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        title="Are you sure you would like to delete this group?"
        disableConfirm={deleteGroupMutation.isPending}
      >
        <div className="space-y-4 text-left">
          <p className="text-red-600 font-medium">Warning: This action cannot be undone!</p>
          <p>Deleting this group will:</p>
          <ul className="list-disc pl-5 text-gray-600">
            <li>Permanently remove the group</li>
            <li>Delete all line items within the group</li>
            <li>Remove all associated pricing and options</li>
          </ul>
          {modalErrorMessage && (
            <div className="text-rose-700">{modalErrorMessage}</div>
          )}
        </div>
      </Modal>
    );
  }

  return (
    <div className="relative inline-block text-left">
      <ThreeDotButton onClick={toggleDropdown} menuIsOpen={isDropdownOpen} />
      {isDropdownOpen && (
        <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
          <ul className="py-1">
            {actions.map((action, index) => (
              <li
                key={index}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer active:bg-gray-200 active:shadow-inner"
                onClick={() => {
                  action.action();
                  setIsDropdownOpen(false);
                }}
              >
                {action.icon}
                <span className="ml-2">{action.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {renderEditModal()}
      {renderDeleteConfirmationModal()}
    </div>
  );
} 