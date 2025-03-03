import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PanelTableColumn } from "../../components/panel-table";
import PanelTable from "../../components/panel-table";
import { useNavigate } from "react-router-dom";
import { Project } from "../../app/types/project";
import { createBlankProject, getCurrentUser, searchProjects } from "../../api/api";
import Button from "../../components/button";
import { FaPlus, FaChevronLeft, FaChevronRight, FaStar } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";
import Modal from "../../components/modal";
import AddProjectModal from "../../components/add-project-modal";
import { useDebounce } from "../../hooks/useDebounce";
import { useUserRole } from "../../hooks/useUserRole";

export default function ProjectsPanel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState("1");
  const [addProjectModalIsOpen, setAddProjectModalIsOpen] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Queries
  const { data, isLoading } = useQuery({
    queryKey: ["projects", debouncedSearch, currentPage],
    queryFn: async () => {
      const response = await searchProjects({
        query: debouncedSearch,
        page: currentPage,
        limit: "10"
      });
      return response;
    },
    staleTime: 10000 // Cache results for 10 seconds
  });


  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage("1"); // Reset to first page on new search
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage.toString());
  };

  const handleRowClick = (project: Project) => {
    navigate(`/project/${project.id}`);
  };
  const columns: PanelTableColumn<Project>[] = [
    {
      columnName: "",
      orderIndex: 0,
      cellRenderer: (project) => (
        project.isStarred ? <FaStar className="text-yellow-500" size={16} /> : null
      )
    },
    {
      columnName: "Client",
      dataObjectKey: "name",
      orderIndex: 1,
      cellRenderer: (project) =>
        project.clients.map((client, index) => {
          const isLastElement = project.clients.length == index + 1;
          return (
            <span key={client.id}>{`${client.firstName} ${client.lastName}${
              isLastElement ? "" : ", "
            }`}</span>
          );
        }),
    },
    {
      columnName: "Project",
      dataObjectKey: "name",
      orderIndex: 2,
    },
    {
      columnName: "Sales Team",
      dataObjectKey: "users",
      orderIndex: 3,
      cellRenderer: (project) =>
        project.users.map((user, index) => {
          const isLastElement = project.users.length == index + 1;
          return (
            <span key={user.id}>{`${user.firstName} ${user.lastName}${
              isLastElement ? "" : ", "
            }`}</span>
          );
        }),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={handleSearch}
          className="px-4 py-2 border rounded-lg"
        />
        <Button variant="white" onClick={() => setAddProjectModalIsOpen(true)}>
          <FaPlus />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">Loading projects...</div>
      ) : !data ? (
        <div className="text-center py-4 text-gray-500">Error loading projects</div>
      ) : data.projects.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          {searchQuery ? "No projects found matching your search" : "No projects yet"}
        </div>
      ) : (
        <>
          <PanelTable
            data={data.projects}
            columns={columns}
            onRowClick={handleRowClick}
          />
          {data.pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <Button
                variant="white"
                onClick={() => handlePageChange(Number(currentPage) - 1)}
                disabled={currentPage === "1"}
                className="disabled:bg-white disabled:border-gray-200"
              >
                <FaChevronLeft className="disabled:text-gray-300" />
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {data.pagination.pages} 
              </span>
              <Button
                variant="white"
                onClick={() => handlePageChange(Number(currentPage) + 1)}
                disabled={currentPage === data.pagination.pages.toString()}
                className="disabled:bg-white disabled:border-gray-200"
              >
                <FaChevronRight className="disabled:text-gray-300" />
              </Button>
            </div>
          )}
        </>
      )}

      <AddProjectModal
        isOpen={addProjectModalIsOpen}
        setIsOpen={setAddProjectModalIsOpen}
      />
    </div>
  );
}
