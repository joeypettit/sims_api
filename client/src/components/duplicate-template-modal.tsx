import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { duplicateAreaTemplate } from "../api/api"; 
import Modal from "./modal";

interface DuplicateTemplateModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  templateId: string;
  originalTemplateName: string;
}

export default function DuplicateTemplateModal({
  isOpen,
  setIsOpen,
  templateId,
  originalTemplateName,
}: DuplicateTemplateModalProps) {
  const [duplicateName, setDuplicateName] = useState(`${originalTemplateName} Copy`);
  const [modalErrorMessage, setModalErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const duplicateAreaTemplateMutation = useMutation({
    mutationFn: duplicateAreaTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-area-templates"] });
      setIsOpen(false);
      setDuplicateName(`${originalTemplateName} Copy`);
      setModalErrorMessage(null);
    },
    onError: (error: Error) => {
      setModalErrorMessage(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!duplicateName.trim()) {
      setModalErrorMessage("Template name is required");
      return;
    }

    duplicateAreaTemplateMutation.mutate({
      templateId,
      name: duplicateName.trim(),
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setDuplicateName(`${originalTemplateName} Copy`);
    setModalErrorMessage(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Duplicate Template"
      actionButtons={[
        {
          variant: "white",
          onClick: handleClose,
          children: "Cancel",
        },
        {
          variant: "primary",
          onClick: handleSubmit,
          disabled: duplicateAreaTemplateMutation.isPending,
          children: duplicateAreaTemplateMutation.isPending ? "Duplicating..." : "Duplicate",
        },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="duplicateName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            New Template Name
          </label>
          <input
            type="text"
            id="duplicateName"
            value={duplicateName}
            onChange={(e) => setDuplicateName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600"
            placeholder="Enter template name"
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