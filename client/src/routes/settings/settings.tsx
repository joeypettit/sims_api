import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Button from "../../components/button";
import { useEffect, useRef, useState } from "react";
import Modal from "../../components/modal";
import { validateTemplateName } from "../../util/form-validation";
import { createAreaTemplate, createUnit, deleteUnit, getUnits, deleteTemplate } from "../../api/api";
import SimsSpinner from "../../components/sims-spinner/sims-spinner";
import { getAllAreaTemplates } from "../../api/api";
import UnitsList from "../../components/units-list";
import AddUnitModal from "../../components/add-unit-modal";
import TemplatesList from "../../components/templates-list";

export default function SettingsPanel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] = useState(false);
  const [isCreateUnitModalOpen, setIsCreateUnitModalOpen] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState("");
  const [templateModalErrorMessage, setTemplateModalErrorMessage] = useState<String>("");
  const [unitErrorMessage, setUnitErrorMessage] = useState<string | null>(null);
  const [unitModalErrorMessage, setUnitModalErrorMessage] = useState<string>("");
  const [templateErrorMessage, setTemplateErrorMessage] = useState<string | null>(null);

  // Set focus on the input element when the modal opens
  const templateInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isCreateTemplateModalOpen && templateInputRef.current) {
      templateInputRef.current.focus();
    }
  }, [isCreateTemplateModalOpen]);

  // Fetch all templates
  const allTemplatesQuery = useQuery({
    queryKey: ["all-area-templates"],
    queryFn: async () => {
      const templates = await getAllAreaTemplates();
      return templates;
    },
  });

  // Fetch all units
  const allUnitsQuery = useQuery({
    queryKey: ["units"],
    queryFn: getUnits,
  });

  const createAreaTemplateMutation = useMutation({
    mutationFn: createAreaTemplate,
    onError: (error, variables, context) => {
      setTemplateModalErrorMessage(
        "There has been an error creating a new template. Please try again."
      );
    },
    onSuccess: (data, variables, context) => {
      setTemplateNameInput("");
      setIsCreateTemplateModalOpen(false);
      navigate(`/settings/edit-template/${data.id}`);
    },
  });

  const createUnitMutation = useMutation({
    mutationFn: createUnit,
    onError: () => {
      setUnitModalErrorMessage(
        "There has been an error creating a new unit. Please try again."
      );
    },
    onSuccess: () => {
      setIsCreateUnitModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
  });

  const deleteUnitMutation = useMutation({
    mutationFn: deleteUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      setUnitErrorMessage(null);
    },
    onError: (error: Error) => {
      setUnitErrorMessage(error.message);
      // Clear error message after 3 seconds
      setTimeout(() => setUnitErrorMessage(null), 3000);
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-area-templates"] });
      setTemplateErrorMessage(null);
    },
    onError: (error: Error) => {
      setTemplateErrorMessage(error.message);
      setTimeout(() => setTemplateErrorMessage(null), 3000);
    }
  });

  async function handleTemplateModalConfirm() {
    setTemplateModalErrorMessage("");
    const errorMessage = validateTemplateName(templateNameInput);
    if (errorMessage) {
      setTemplateModalErrorMessage(errorMessage);
      return;
    }
    const trimmedName = templateNameInput.trim();
    createAreaTemplateMutation.mutate(trimmedName);
  }

  function handleTemplateModalCancel() {
    setIsCreateTemplateModalOpen(false);
    setTemplateNameInput("");
    setTemplateModalErrorMessage("");
  }

  if (allTemplatesQuery.isLoading || createAreaTemplateMutation.isPending || allUnitsQuery.isLoading) {
    return (
      <>
        <div className="flex justify-center items-center w-full h-full">
          <SimsSpinner />
        </div>
      </>
    );
  }

  if (allTemplatesQuery.isError) {
    return <p>Error: {allTemplatesQuery.error.message}</p>;
  }

  if (allUnitsQuery.isError) {
    return <p>Error: {allUnitsQuery.error.message}</p>;
  }

  function renderTemplateModal() {
    return (
      <Modal
        isOpen={isCreateTemplateModalOpen}
        title="Please give your template a name."
        onConfirm={() => handleTemplateModalConfirm()}
        onCancel={() => handleTemplateModalCancel()}
      >
        <div className="flex flex-col justify-center items-center">
          <p className="text-sm text-gray-500 pb-4">
            This template name will be used for internal reference only and will
            not be displayed to clients.
          </p>
          <label htmlFor="templateName" className={`block mb-2`}>
            Template Name:
          </label>
          <input
            type="text"
            autoComplete="off"
            id="template-name"
            name="template-name"
            ref={templateInputRef}
            value={templateNameInput}
            onChange={(e) => setTemplateNameInput(e.target.value)}
            required
            className="w-full p-2 border rounded-md mb-4"
          />
          {templateModalErrorMessage && (
            <div className="text-rose-700">{templateModalErrorMessage}</div>
          )}
        </div>
      </Modal>
    );
  }

  return (
    <>
      <h1 className="font-bold">Settings</h1>
      <div className="flex flex-col items-center gap-6 my-20">
        <div className="w-1/2">
          <TemplatesList
            templates={allTemplatesQuery.data || []}
            onRemoveTemplate={(templateId) => deleteTemplateMutation.mutate(templateId)}
            onAddTemplate={() => setIsCreateTemplateModalOpen(true)}
            errorMessage={templateErrorMessage}
            isRemoveLoading={deleteTemplateMutation.isPending}
          />
        </div>

        <div className="w-1/2">
          <UnitsList
            units={allUnitsQuery.data || []}
            onRemoveUnit={(unitId) => deleteUnitMutation.mutate(unitId)}
            onAddUnit={() => setIsCreateUnitModalOpen(true)}
            errorMessage={unitErrorMessage}
            isRemoveLoading={deleteUnitMutation.isPending}
          />
        </div>
      </div>
      {renderTemplateModal()}
      <AddUnitModal
        isOpen={isCreateUnitModalOpen}
        onConfirm={(unitName) => createUnitMutation.mutate({ unitName })}
        onCancel={() => {
          setIsCreateUnitModalOpen(false);
          setUnitModalErrorMessage("");
        }}
        errorMessage={unitModalErrorMessage}
      />
    </>
  );
}
