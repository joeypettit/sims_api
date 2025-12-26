import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa6";
import Button from "./button";
import AddProjectModal from "./add-project-modal";

type ProjectSummary = {
  id: string;
  name: string;
};

type ProjectsListProps = {
  projects: ProjectSummary[];
  clientId?: string; // Optional client ID for creating new projects
};

export default function ProjectsList({
  projects,
  clientId,
}: ProjectsListProps) {
  const navigate = useNavigate();
  const [addProjectModalIsOpen, setAddProjectModalIsOpen] = useState(false);

  return (
    <div className="border border-gray-300 p-4 rounded shadow">
      <div className="flex flex-row mb-4 justify-between items-center">
        <h2 className="font-bold">Projects</h2>
        <Button
          size="xs"
          variant="white"
          onClick={() => setAddProjectModalIsOpen(true)}
          className="py-1"
        >
          <FaPlus />
        </Button>
      </div>
      <div>
        <ul>
          {projects.map((project) => (
            <li
              key={project.id}
              onClick={() => navigate(`/project/${project.id}`)}
              className="group p-2 bg-white odd:bg-sims-green-100 rounded flex justify-between items-center hover:bg-sims-green-200 active:shadow-inner cursor-pointer"
            >
              <span>{project.name}</span>
            </li>
          ))}
          {projects.length === 0 && (
            <li className="text-gray-500 text-center py-2">
              No projects found
            </li>
          )}
        </ul>
      </div>
      <AddProjectModal
        isOpen={addProjectModalIsOpen}
        setIsOpen={setAddProjectModalIsOpen}
        clientId={clientId}
      />
    </div>
  );
} 