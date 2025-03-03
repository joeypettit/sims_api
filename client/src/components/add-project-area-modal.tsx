import React, { useEffect, useRef, useState } from "react";
import Modal from "./modal";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createBlankProjectArea, getAllAreaTemplates } from "../api/api";
import type { Project } from "../app/types/project";
import type { AreaTemplate } from "../app/types/area-template";
import { FaCheck } from "react-icons/fa6";
import { createAreaFromTemplate } from "../api/api";

type AddProjectAreaModalProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  project?: Project;
};

export default function AddProjectAreaModal({
  isOpen,
  setIsOpen,
  project,
}: AddProjectAreaModalProps) {
  const navigate = useNavigate();
  const [areaNameInput, setAreaNameInput] = useState("");
  const [modalErrorMessage, setModalErrorMessage] = useState<string>("");
  const [creationOption, setCreationOption] = useState<"scratch" | "template">(
    "template"
  );
  const [screenDisplayed, setScreenDisplayed] = useState<1 | 2>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<AreaTemplate>();

  const allAreaTemplatesQuery = useQuery({
    queryKey: ["all-area-templates"],
    queryFn: async () => {
      const result = await getAllAreaTemplates();
      return result;
    },
  });

  const createBlankAreaMutation = useMutation({
    mutationFn: async () => {
      if (project?.id) {
        const result = await createBlankProjectArea({
          name: areaNameInput,
          projectId: project.id,
        });
        return result;
      }
      throw Error("Project Id required to create new project area");
    },
    onSuccess: (data) => {
      console.log("SUCCESS", data, project?.id);
      if (project?.id) {
        navigate(`/project/${project.id}/area/${data.id}`);
      }
    },
    onError: (error) => {
      console.error("Error creating project:", error);
      throw Error(`Error creating project: ${error}`);
    },
  });

  const createAreaFromTemplateMutation = useMutation({
    mutationFn: async () => {
      if (project?.id && selectedTemplate) {
        const result = await createAreaFromTemplate({
          name: areaNameInput,
          projectId: project.id,
          templateId: selectedTemplate.id,
        });
        return result;
      }
      throw Error(
        "Project Id and template id required to create new project area"
      );
    },
    onSuccess: (data) => {
      if (project?.id) {
        navigate(`/project/${project.id}/area/${data.id}`);
      }
    },
    onError: (error) => {
      console.error("Error creating project:", error);
      throw Error(`Error creating project: ${error}`);
    },
  });

  function handleCancel() {
    setAreaNameInput("");
    setModalErrorMessage("");
    setCreationOption("template");
    setScreenDisplayed(1);
    setSelectedTemplate(undefined);
    setIsOpen(false);
  }

  function handleNextButtonClick() {
    setModalErrorMessage("");
    if (areaNameInput == "") {
      setModalErrorMessage("Area Name Is Required");
      return;
    }
    if (creationOption == "scratch") {
      createBlankAreaMutation.mutate();
      return;
    }
    if (screenDisplayed == 1) {
      setScreenDisplayed(2);
      return;
    }
    if (!selectedTemplate) {
      setModalErrorMessage("Please select a template before proceding.");
      return;
    }
    createAreaFromTemplateMutation.mutate();
  }

  function handleTemplateListClick(template: AreaTemplate) {
    console.log("selected");
    setSelectedTemplate(template);
    setModalErrorMessage("");
  }

  function renderScreenOne() {
    return (
      <div className="flex flex-col justify-center items-center">
        <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-1">
          Project Area Name:
        </label>
        <input
          type="text"
          autoComplete="off"
          id="project-name"
          name="project-name"
          ref={inputRef}
          value={areaNameInput}
          onChange={(e) => setAreaNameInput(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600"
        />
        <fieldset className="mb-4">
          <legend className="text-sm font-medium mb-2">Create Option:</legend>
          <div className="flex flex-col">
            <label>
              <input
                type="radio"
                name="creationOption"
                value="template"
                checked={creationOption === "template"}
                onChange={() => setCreationOption("template")}
                className="mr-2"
              />
              Create from template
            </label>
            <label className="mb-2">
              <input
                type="radio"
                name="creationOption"
                value="scratch"
                checked={creationOption === "scratch"}
                onChange={() => setCreationOption("scratch")}
                className="mr-2"
              />
              Create from scratch
            </label>
          </div>
        </fieldset>
        {modalErrorMessage && (
          <div className="text-rose-700">{modalErrorMessage}</div>
        )}
      </div>
    );
  }

  function renderScreenTwo() {
    return (
      <div className="flex flex-col justify-center items-center">
        <h1>Please select a template.</h1>
        <ul className="scroll-auto max-h-60 overflow-scroll rounded">
          {allAreaTemplatesQuery.data?.map((template) => {
            console.log(
              "selected template",
              selectedTemplate?.id == template.id
            );
            return (
              <li
                key={template.id}
                className={
                  selectedTemplate?.id == template.id
                    ? "bg-sims-green-400 p-1 cursor-pointer hover:bg-sims-green-400 shadow-inner"
                    : "p-1 cursor-pointer bg-white odd:bg-sims-green-100 hover:bg-sims-green-200 active:shadow-inner"
                }
                onClick={() => handleTemplateListClick(template)}
              >
                <div className="grid grid-cols-4">
                  <div className="flex items-center p-1">
                    {selectedTemplate?.id == template.id && <FaCheck />}
                  </div>
                  <div className="col-span-3 flex justify-start p-1">
                    {template.name}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {modalErrorMessage && (
          <div className="text-rose-700">{modalErrorMessage}</div>
        )}
      </div>
    );
  }

  // Set focus on the input element when the modal opens
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      title="New Project Area"
      onCancel={handleCancel}
      actionButtons={[
        {
          variant: "primary",
          children: "Next",
          onClick: handleNextButtonClick,
        },
      ]}
    >
      {screenDisplayed == 1 ? renderScreenOne() : renderScreenTwo()}
    </Modal>
  );
}
