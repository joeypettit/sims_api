import { useNavigate } from "react-router-dom";

type ProjectSummary = {
  id: string;
  name: string;
};

type ClientProjectsListProps = {
  projects: ProjectSummary[];
};

export default function ClientProjectsList({
  projects,
}: ClientProjectsListProps) {
  const navigate = useNavigate();

  return (
    <div className="border border-gray-300 p-4 rounded shadow">
      <div className="flex flex-row justify-between">
        <h2 className="font-bold mb-4">Projects</h2>
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
    </div>
  );
} 