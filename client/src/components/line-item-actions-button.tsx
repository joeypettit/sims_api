import { useEffect, useRef, useState } from "react";
import ThreeDotButton from "./three-dot-button";
import { MdOutlineEdit } from "react-icons/md";
import { MdOutlineDeleteForever } from "react-icons/md";
import { BiAddToQueue } from "react-icons/bi";
import Modal from "./modal";
import { LineItem } from "../app/types/line-item";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteLineItem } from "../api/api";
import SimsSpinner from "./sims-spinner/sims-spinner";
import { useNavigate } from "react-router-dom";

type LineItemActionButtonProps = {
  lineItem: LineItem;
  projectId: string;
  projectAreaId: string;
};

export default function LineItemActionsButton({
  lineItem,
  projectId,
  projectAreaId
}: LineItemActionButtonProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState<String>("");
  const [modalButtonsDisabled, setModalButtonsDisabled] = useState(false);

  const actions = [
    {
      icon: <MdOutlineEdit />,
      title: "Edit",
      action: () => {
        navigate(`/edit-line-item/${lineItem.id}`);
      },
    },
    {
      icon: <MdOutlineDeleteForever />,
      title: "Delete",
      action: () => {
        setIsDeleteModalOpen(true);
      },
    },
  ];

  function toggleDropdown() {
    setIsDropdownOpen((prev) => !prev);
  }

  const deleteLineItemMutation = useMutation({
    mutationFn: deleteLineItem,
    onError: (error, variables, context) => {
      setModalErrorMessage(
        `There has been an error deleting line item with id ${variables.lineItemId}. Please try again.`
      );
      setModalButtonsDisabled(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["area"] });
      queryClient.invalidateQueries({ queryKey: ["area-cost", projectAreaId] });
      queryClient.invalidateQueries({ queryKey: ["project-cost", projectId] });
      setIsDeleteModalOpen(false);
    },
  });

  function handleDelete() {
    setModalButtonsDisabled(true);
    deleteLineItemMutation.mutate({
      lineItemId: lineItem.id,
    });
  }

  function renderDeleteConfirmationModal() {
    return (
      <Modal
        isOpen={isDeleteModalOpen}
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
        }}
        title="Are you sure you would like to delete this line item?"
        disableCancel={modalButtonsDisabled}
        disableConfirm={modalButtonsDisabled}
      >
        <div className="text-gray-600">This action is not reversible.</div>
        {modalErrorMessage && (
          <div className="text-rose-700">{modalErrorMessage}</div>
        )}
        {deleteLineItemMutation.isPending && (
          <SimsSpinner centered withLogo={false} />
        )}
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
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100  cursor-pointer active:bg-gray-200 active:shadow-inner"
                onClick={() => {
                  action.action();
                  setIsDropdownOpen(false); // Close the dropdown after clicking
                }}
              >
                {action.icon}
                <span className="ml-2">{action.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {renderDeleteConfirmationModal()}
    </div>
  );
}
