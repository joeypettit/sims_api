import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProjectById, removeUserFromProject, removeClientFromProject, getProjectCostRange, updateProjectDates, deleteProject, starProject, unstarProject, isProjectStarred } from "../../api/api";
import Button from "../../components/button";
import AddProjectManagerModal from "../../components/add-project-manager-modal";
import AddProjectClientModal from "../../components/add-project-client-modal";
import PanelHeaderBar from "../../components/page-header-bar";
import AddProjectAreaModal from "../../components/add-project-area-modal";
import DeleteProjectAreaModal from "../../components/delete-project-area-modal";
import { useState } from "react";
import { Project } from "../../app/types/project";
import ProjectManagersList from "../../components/project-managers-list";
import ProjectClientsList from "../../components/project-clients-list";
import { FaPlus, FaPen, FaCheck, FaTimes, FaTrash, FaStar, FaRegStar } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import { formatNumberWithCommas } from "../../util/utils";
import IconButton from "../../components/icon-button";
import Modal from "../../components/modal";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAddAreaModal, setShowAddAreaModal] = useState(false);
  const [showAddManagerModal, setShowAddManagerModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showDeleteAreaModal, setShowDeleteAreaModal] = useState(false);
  const [selectedAreaToDelete, setSelectedAreaToDelete] = useState<{ id: string; name: string | null } | null>(null);
  const [managerErrorMessage, setManagerErrorMessage] = useState<string | null>(null);
  const [clientErrorMessage, setClientErrorMessage] = useState<string | null>(null);
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const projectQuery = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectById(id || ""),
    enabled: !!id,
  });

  const projectCostQuery = useQuery({
    queryKey: ["project-cost", id],
    queryFn: () => getProjectCostRange(id || ""),
    enabled: !!id,
  });

  const queryClient = useQueryClient();

  const { data: isStarred } = useQuery({
    queryKey: ["project", id, "starred"],
    queryFn: () => isProjectStarred(id!),
    enabled: !!id
  });

  const starMutation = useMutation({
    mutationFn: starProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id, "starred"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  });

  const unstarMutation = useMutation({
    mutationFn: unstarProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id, "starred"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  });

  const removeUserMutation = useMutation({
    mutationFn: (userId: string) => {
      if (projectQuery.data?.users.length === 1) {
        throw new Error("Project must have at least one manager");
      }
      return removeUserFromProject(id || '', userId);
    },
    onSuccess: () => {
      projectQuery.refetch();
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setManagerErrorMessage(null);
    },
    onError: (error: Error) => {
      setManagerErrorMessage(error.message);
      // Clear error message after 3 seconds
      setTimeout(() => setManagerErrorMessage(null), 3000);
    }
  });

  const removeClientMutation = useMutation({
    mutationFn: (clientId: string) => removeClientFromProject(id || '', clientId),
    onSuccess: () => {
      projectQuery.refetch();
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setClientErrorMessage(null);
    },
    onError: (error: Error) => {
      setClientErrorMessage(error.message);
      setTimeout(() => setClientErrorMessage(null), 3000);
    }
  });

  const updateDatesMutation = useMutation({
    mutationFn: ({ startDate, endDate }: { startDate: Date | null, endDate: Date | null }) =>
      updateProjectDates(id || '', startDate, endDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setIsEditingDates(false);
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => deleteProject(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate('/projects');
    }
  });

  function handleAddAreaClick() {
    setShowAddAreaModal(true);
  }

  function handleAddManagerClick() {
    setShowAddManagerModal(true);
  }

  function handleAddClientClick() {
    setShowAddClientModal(true);
  }

  function handleDeleteAreaClick(areaId: string, areaName: string | null, e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedAreaToDelete({ id: areaId, name: areaName });
    setShowDeleteAreaModal(true);
  }

  function handleDeleteModalClose() {
    setShowDeleteAreaModal(false);
    setSelectedAreaToDelete(null);
  }

  function getProjectTotalCost() {
    if (!projectCostQuery.data) return "-";
    
    if (projectCostQuery.data.lowPriceInDollars <= 0 && projectCostQuery.data.highPriceInDollars <= 0) {
      return "-";
    }

    const lowPrice = formatNumberWithCommas(projectCostQuery.data.lowPriceInDollars);
    const highPrice = formatNumberWithCommas(projectCostQuery.data.highPriceInDollars);
    return `$${lowPrice} - $${highPrice}`;
  }

  const handleDateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;

    updateDatesMutation.mutate({
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null
    });
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    const form = e.currentTarget.closest('form');
    if (form) {
      form.reset();  // Reset form to default values
    }
    setIsEditingDates(false);
  };

  const handleStarClick = () => {
    if (isStarred) {
      unstarMutation.mutate(id!);
    } else {
      starMutation.mutate(id!);
    }
  };

  if (projectQuery.isLoading || projectCostQuery.isLoading) {
    return <p>Loading...</p>;
  }

  if (projectQuery.isError) {
    return <p>Error: {projectQuery.error.message}</p>;
  }

  if (projectCostQuery.isError) {
    console.error("Error loading project cost:", projectCostQuery.error);
  }

  return (
    <>
      <PanelHeaderBar title={`Project: ${projectQuery.data?.name}`}>
        <div className="flex items-center gap-2">
          <IconButton
            icon={isStarred ? <FaStar size={18} /> : <FaRegStar size={18} />}
            onClick={handleStarClick}
            color={isStarred ? "text-yellow-500" : "text-gray-400"}
            title={isStarred ? "Unstar Project" : "Star Project"}
          />
          <IconButton
            icon={<FaTrash size={16} />}
            onClick={() => setShowDeleteModal(true)}
            color="text-gray-400 hover:text-red-500"
            title="Delete Project"
          />
        </div>
      </PanelHeaderBar>
      <div className="flex flex-col items-center gap-6 mt-20">

        {/* Project Managers and Clients Grid */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-4xl mx-4">
          {/* Clients Section */}
          <ProjectClientsList
            clients={projectQuery.data?.clients || []}
            onRemoveClient={(clientId) => removeClientMutation.mutate(clientId)}
            onAddClient={handleAddClientClick}
            errorMessage={clientErrorMessage}
            isRemoveLoading={removeClientMutation.isPending}
          />

          {/* Project Managers Section */}
          <ProjectManagersList
            users={projectQuery.data?.users || []}
            onRemoveUser={(userId) => removeUserMutation.mutate(userId)}
            onAddManager={handleAddManagerClick}
            errorMessage={managerErrorMessage}
            isRemoveLoading={removeUserMutation.isPending}
          />
        </div>

        {/* Project Dates Section */}
        <div className="border border-gray-300 p-4 rounded shadow w-full max-w-4xl mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold">Project Dates</h2>
            {!isEditingDates && (
              <IconButton
                icon={<FaPen />}
                onClick={() => setIsEditingDates(true)}
                color="text-gray-600 hover:text-gray-800"
                title="Edit dates"
              />
            )}
          </div>

          <form onSubmit={handleDateSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  defaultValue={projectQuery.data?.startDate?.split('T')[0]}
                  disabled={!isEditingDates}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  defaultValue={projectQuery.data?.endDate?.split('T')[0]}
                  disabled={!isEditingDates}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600 disabled:bg-gray-100"
                />
              </div>
            </div>

            {isEditingDates && (
              <div className="flex justify-center gap-2 mt-4">
                <Button 
                  variant="white" 
                  onClick={handleCancel}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={updateDatesMutation.isPending}
                >
                  {updateDatesMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Project Areas Section */}
        <div className="border border-gray-300 p-4 rounded shadow w-full max-w-4xl mx-4">
          <div className="flex flex-row mb-4 justify-between items-center">
            <h2 className="font-bold">Project Areas</h2>
            <Button
              size="xs"
              variant="white"
              onClick={handleAddAreaClick}
              className="py-1"
            >
              <FaPlus />
            </Button>
          </div>
          <div>
            <ul>
              {projectQuery.data?.areas.map((area) => {
                return (
                  <li
                    key={area.id}
                    className="group p-2 cursor-pointer bg-white odd:bg-sims-green-100 hover:bg-sims-green-200 active:shadow-inner rounded flex justify-between items-center"
                    onClick={() => navigate(`area/${area.id}`)}
                  >
                    <span>{area.name}</span>
                    <IconButton
                      icon={<FaTrash />}
                      onClick={(e) => handleDeleteAreaClick(area.id, area.name, e)}
                      className="opacity-0 group-hover:opacity-100"
                      title="Delete area"
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Project Total Cost */}
        <div className="p-8 border border-gray-300 font-bold rounded shadow">
          Project Total: {getProjectTotalCost()}
        </div>
      </div>
      <AddProjectAreaModal
        isOpen={showAddAreaModal}
        setIsOpen={setShowAddAreaModal}
        project={projectQuery.data}
      />
      <AddProjectManagerModal
        isOpen={showAddManagerModal}
        setIsOpen={setShowAddManagerModal}
        projectId={id || ''}
        currentUsers={projectQuery.data?.users || []}
      />
      <AddProjectClientModal
        isOpen={showAddClientModal}
        setIsOpen={setShowAddClientModal}
        projectId={id || ''}
        currentClients={projectQuery.data?.clients || []}
      />
      {selectedAreaToDelete && (
        <DeleteProjectAreaModal
          isOpen={showDeleteAreaModal}
          setIsOpen={handleDeleteModalClose}
          areaId={selectedAreaToDelete.id}
          projectId={id || ''}
          areaName={selectedAreaToDelete.name || ''}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        title="Delete Project"
        actionButtons={[
          {
            variant: "white",
            onClick: () => setShowDeleteModal(false),
            children: "Cancel"
          },
          {
            variant: "danger",
            onClick: () => deleteProjectMutation.mutate(),
            disabled: deleteProjectMutation.isPending,
            children: deleteProjectMutation.isPending ? "Deleting..." : "Delete"
          }
        ]}
      >
        <div className="space-y-4 text-left">
          <p className="text-red-600 font-medium">Warning: This action cannot be undone!</p>
          <p>Deleting this project will:</p>
          <ul className="list-disc pl-5 text-gray-600">
            <li>Permanently remove all project information</li>
            <li>Delete all areas and line items</li>
            <li>Remove all client and user associations</li>
          </ul>
          {deleteProjectMutation.isError && (
            <p className="text-red-600 mt-2">
              {deleteProjectMutation.error.message || "Error deleting project"}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
