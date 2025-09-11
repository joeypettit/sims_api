import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { duplicateProjectArea } from "../api/api";
import Modal from "./modal";

interface DuplicateProjectAreaModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  areaId: string;
  projectId: string;
  originalAreaName: string;
}

export default function DuplicateProjectAreaModal({
  isOpen,
  setIsOpen,
  areaId,
  projectId,
  originalAreaName,
}: DuplicateProjectAreaModalProps) {
  const [duplicateName, setDuplicateName] = useState(`${originalAreaName} Copy`);
  const [modalErrorMessage, setModalErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const duplicateAreaMutation = useMutation({
    mutationFn: duplicateProjectArea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      setIsOpen(false);
      setDuplicateName(`${originalAreaName} Copy`);
      setModalErrorMessage(null);
    },
    onError: (error: Error) => {
      setModalErrorMessage(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!duplicateName.trim()) {
      setModalErrorMessage("Area name is required");
      return;
    }

    duplicateAreaMutation.mutate({
      areaId,
      name: duplicateName.trim(),
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setDuplicateName(`${originalAreaName} Copy`);
    setModalErrorMessage(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Duplicate Project Area"
      actionButtons={[
        {
          variant: "white",
          onClick: handleClose,
          children: "Cancel",
        },
        {
          variant: "primary",
          onClick: handleSubmit,
          disabled: duplicateAreaMutation.isPending,
          children: duplicateAreaMutation.isPending ? "Duplicating..." : "Duplicate",
        },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="duplicateName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            New Area Name
          </label>
          <input
            type="text"
            id="duplicateName"
            value={duplicateName}
            onChange={(e) => setDuplicateName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600"
            placeholder="Enter area name"
            autoFocus
          />
        </div>
        
        {modalErrorMessage && (
          <div className="text-red-600 text-sm">
            {modalErrorMessage}
          </div>
        )}
      </form>
    </Modal>
  );
} 