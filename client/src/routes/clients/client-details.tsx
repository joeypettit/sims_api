import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { getClient, updateClient, deleteClient } from "../../api/api";
import { useState, useEffect } from "react";
import Button from "../../components/button";
import IconButton from "../../components/icon-button";
import PanelHeaderBar from "../../components/page-header-bar";
import Modal from "../../components/modal";
import ProjectsList from "../../components/projects-list";
import { FaTrash } from "react-icons/fa";
import { MdEdit } from "react-icons/md";

export default function ClientDetails() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  const { data: client, isLoading } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => getClient(clientId!),
    enabled: !!clientId
  });

  const updateClientMutation = useMutation({
    mutationFn: (data: { clientId: string, firstName: string, lastName: string, email?: string, phone?: string }) => 
      updateClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      setIsEditing(false);
    }
  });

  const deleteClientMutation = useMutation({
    mutationFn: () => deleteClient(clientId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      navigate("/clients");
    }
  });

  // Initialize form data when client data is loaded
  useEffect(() => {
    if (client) {
      setFormData({
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email || '',
        phone: client.phone || ''
      });
    }
  }, [client]);

  const startEditing = () => {
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;

    updateClientMutation.mutate({
      clientId,
      ...formData
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (client) {
      setFormData({
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email || '',
        phone: client.phone || ''
      });
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!client) {
    return <div>Client not found</div>;
  }

  return (
    <>
      <PanelHeaderBar title={`Client: ${client.firstName} ${client.lastName}`} />
      <div className="flex flex-col items-center gap-6 mt-20">
        <div className="w-full max-w-4xl mx-4">
          <div className="border border-gray-300 p-4 rounded shadow mb-6">
            <div className="flex justify-between mb-4">
              <h2 className="font-bold">Client Details</h2>
              <div className="space-x-2">
                {!isEditing && (
                  <>
                    <IconButton
                      icon={<FaTrash size={18} />}
                      onClick={handleDelete}
                      color="text-gray-600 hover:text-gray-800"
                      title="Delete Client"
                    />
                    <IconButton
                      icon={<MdEdit size={20} />}
                      onClick={startEditing}
                      color="text-gray-600 hover:text-gray-800"
                      title="Edit Client"
                    />
                  </>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600 disabled:bg-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600 disabled:bg-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600 disabled:bg-gray-100"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-center gap-2">
                  <Button variant="white" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={updateClientMutation.isPending}
                  >
                    {updateClientMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}

              {updateClientMutation.isError && (
                <div className="text-red-600 text-center">
                  {updateClientMutation.error.message || "Error updating client"}
                </div>
              )}
            </form>
          </div>

          {/* Projects List */}
          <ProjectsList projects={client.projects || []} clientId={client.id} />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        title="Delete Client"
        actionButtons={[
          {
            variant: "white",
            onClick: () => setShowDeleteModal(false),
            children: "Cancel"
          },
          {
            variant: "danger",
            onClick: () => deleteClientMutation.mutate(),
            disabled: deleteClientMutation.isPending,
            children: deleteClientMutation.isPending ? "Deleting..." : "Delete"
          }
        ]}
      >
        <div className="space-y-4 text-left">
          <p className="text-red-600 font-medium">Warning: This action cannot be undone!</p>
          <p>Deleting this client will:</p>
          <ul className="list-disc pl-5 text-gray-600">
            <li>Permanently remove their information from the system</li>
            <li>Remove them from all associated projects</li>
            <li>Delete all their project history and associations</li>
          </ul>
          {deleteClientMutation.isError && (
            <p className="text-red-600 mt-2">
              {deleteClientMutation.error.message || "Error deleting client"}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
} 