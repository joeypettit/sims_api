import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Modal from './modal';
import { searchUsers, addUserToProject } from '../api/api';
import { User } from '../app/types/user';
import { useDebounce } from '../hooks/useDebounce';
import Button from './button';

type AddProjectManagerModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  projectId: string;
  currentUsers: User[];
};

export default function AddProjectManagerModal({ 
  isOpen, 
  setIsOpen, 
  projectId,
  currentUsers 
}: AddProjectManagerModalProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Query for users with search
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users', 'search', debouncedSearch],
    queryFn: () => searchUsers({ query: debouncedSearch, page: "1", limit: "10" }),
    enabled: isOpen // Only fetch when modal is open
  });

  // Filter out users that are already project managers
  const availableUsers = users?.users.filter(
    user => !currentUsers.some(currentUser => currentUser.id === user.id)
  ) || [];
  
  console.log('Users after filtering out current project managers:', availableUsers.length);

  // Mutation for adding a user
  const addUserMutation = useMutation({
    mutationFn: (userId: string) => addUserToProject(projectId, userId),
    onSuccess: () => {
      // Invalidate and refetch project data
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      // Invalidate projects list to reflect the updated manager
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
      title="Add Project Manager"
      onCancel={handleClose}
    >
      <div className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600"
          />
        </div>

        <div className="max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">
              Error loading users. Please try again.
            </div>
          ) : availableUsers.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              {searchQuery ? "No users found" : "No available users"}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {availableUsers.map((user) => (
                <li
                  key={user.id}
                  className="p-2 hover:bg-sims-green-50 flex justify-between items-center"
                >
                  <div className="text-left">
                    {user.firstName} {user.lastName}
                  </div>
                  <Button
                    variant="outline-primary"
                    size="xs"
                    onClick={() => addUserMutation.mutate(user.id)}
                    disabled={addUserMutation.isPending}
                  >
                    {addUserMutation.isPending ? 'Adding...' : 'Add'}
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
