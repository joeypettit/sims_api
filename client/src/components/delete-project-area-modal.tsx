import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteProjectArea } from "../api/api";
import { ButtonProps } from "./button";
import Modal from "./modal";

type DeleteProjectAreaModalProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  areaId: string;
  projectId: string;
  areaName: string;
};

export default function DeleteProjectAreaModal({
  isOpen,
  setIsOpen,
  areaId,
  projectId,
  areaName,
}: DeleteProjectAreaModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deleteAreaMutation = useMutation({
    mutationFn: () => deleteProjectArea(areaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      setIsOpen(false);
      navigate(`/project/${projectId}`);
    },
    onError: (error: Error) => {
      setErrorMessage(error.message);
      console.error("Error deleting project area:", error);
    }
  });

  function handleCancel() {
    setErrorMessage(null);
    setIsOpen(false);
  }

  function handleConfirm() {
    setErrorMessage(null);
    deleteAreaMutation.mutate();
  }

  const actionButtons: ButtonProps[] = [
    {
      variant: "white",
      onClick: handleCancel,
      children: "Cancel",
    },
    {
      variant: "danger",
      onClick: handleConfirm,
      disabled: deleteAreaMutation.isPending,
      children: deleteAreaMutation.isPending ? "Deleting..." : "Delete",
    },
  ];

  return (
    <Modal isOpen={isOpen} actionButtons={actionButtons}>
      <div className="flex flex-col gap-4">
        <div className="text-red-600 font-semibold">Warning: This action cannot be undone</div>
        <div>
          Are you sure you want to delete the project area "{areaName}"? This will:
          <ul className="list-disc ml-6 mt-2">
            <li>Permanently delete all groups and line items in this area</li>
            <li>Remove all cost and pricing data associated with this area</li>
            <li>Delete all historical data for this area</li>
          </ul>
        </div>
        {errorMessage && (
          <div className="text-red-600 mt-2">
            Error: {errorMessage}
          </div>
        )}
      </div>
    </Modal>
  );
} 