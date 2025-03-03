import { AreaTemplate } from "../app/types/area-template";
import Button from "./button";
import IconButton from "./icon-button";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Modal from "./modal";
import { useState } from "react";

type TemplatesListProps = {
  templates: AreaTemplate[];
  onRemoveTemplate: (templateId: string) => void;
  onAddTemplate: () => void;
  errorMessage: string | null;
  isRemoveLoading: boolean;
};

export default function TemplatesList({
  templates,
  onRemoveTemplate,
  onAddTemplate,
  errorMessage,
  isRemoveLoading
}: TemplatesListProps) {
  const navigate = useNavigate();
  const [templateToDelete, setTemplateToDelete] = useState<AreaTemplate | null>(null);

  const handleDelete = (template: AreaTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setTemplateToDelete(template);
  };

  return (
    <>
      <div className="border border-gray-300 p-4 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold">Templates</h2>
          <Button
            size="xs"
            variant="white"
            onClick={onAddTemplate}
            className="py-1"
          >
            <FaPlus />
          </Button>
        </div>

        {errorMessage && (
          <div className="text-red-500 mb-4">{errorMessage}</div>
        )}

        <ul>
          {templates.map((template) => (
            <li
              key={template.id}
              className="group p-2 cursor-pointer bg-white odd:bg-sims-green-100 hover:bg-sims-green-200 active:shadow-inner rounded flex justify-between items-center"
              onClick={() => navigate(`/settings/edit-template/${template.id}`)}
            >
              <span>{template.name}</span>
              <IconButton
                icon={<FaTrash />}
                onClick={(e) => handleDelete(template, e)}
                disabled={isRemoveLoading}
                className="opacity-0 group-hover:opacity-100"
                title="Delete template"
              />
            </li>
          ))}
        </ul>
      </div>

      <Modal
        isOpen={!!templateToDelete}
        title="Delete Template"
        actionButtons={[
          {
            variant: "white",
            onClick: () => setTemplateToDelete(null),
            children: "Cancel"
          },
          {
            variant: "danger",
            onClick: () => {
              if (templateToDelete) {
                onRemoveTemplate(templateToDelete.id);
                setTemplateToDelete(null);
              }
            },
            disabled: isRemoveLoading,
            children: isRemoveLoading ? "Deleting..." : "Delete"
          }
        ]}
      >
        <div className="space-y-4 text-left">
          <p className="text-red-600 font-medium">Warning: This action cannot be undone!</p>
          <p>Are you sure you want to delete the template "{templateToDelete?.name}"?</p>
          <p>This will:</p>
          <ul className="list-disc pl-5 text-gray-600">
            <li>Delete the template and all its contents</li>
            <li>Remove all associated line items and options</li>
            <li>This will not affect any project areas that were created from this template</li>
          </ul>
        </div>
      </Modal>
    </>
  );
} 