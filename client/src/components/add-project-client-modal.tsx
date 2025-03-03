import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Modal from './modal';
import { searchClients, addClientToProject } from '../api/api';
import { Client } from '../app/types/client';
import { useDebounce } from '../hooks/useDebounce';
import Button from './button';

type AddProjectClientModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  projectId: string;
  currentClients: Client[];
};

export default function AddProjectClientModal({ 
  isOpen, 
  setIsOpen, 
  projectId,
  currentClients 
}: AddProjectClientModalProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Query for clients with search
  const { data: clientsData, isLoading, error } = useQuery({
    queryKey: ['clients', 'search', debouncedSearch],
    queryFn: () => searchClients({ query: debouncedSearch, page: "1", limit: "10" }),
    enabled: isOpen // Only fetch when modal is open
  });

  // Filter out clients that are already in the project
  const availableClients = clientsData?.clients.filter(
    client => !currentClients.some(currentClient => currentClient.id === client.id)
  ) || [];

  // Mutation for adding a client
  const addClientMutation = useMutation({
    mutationFn: (clientId: string) => addClientToProject(projectId, clientId),
    onSuccess: () => {
      // Invalidate and refetch project data
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      // Invalidate projects list to reflect the updated client
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      handleClose();
    }
  });

  const handleClose = () => {
    setSearchQuery('');
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Add Client to Project"
      onCancel={handleClose}
    >
      <div className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600"
          />
        </div>

        <div className="max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-4">Loading clients...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">
              Error loading clients. Please try again.
            </div>
          ) : availableClients.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              {searchQuery ? "No clients found" : "No available clients"}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {availableClients.map((client) => (
                <li
                  key={client.id}
                  className="p-2 hover:bg-sims-green-50 flex justify-between items-center"
                >
                  <div className="text-left">
                    {client.firstName} {client.lastName}
                  </div>
                  <Button
                    variant="outline-primary"
                    size="xs"
                    onClick={() => addClientMutation.mutate(client.id)}
                    disabled={addClientMutation.isPending}
                  >
                    {addClientMutation.isPending ? 'Adding...' : 'Add'}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
} 