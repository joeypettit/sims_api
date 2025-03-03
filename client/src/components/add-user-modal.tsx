import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from './modal';
import { createUser } from '../api/api';
import type { UserRole } from '../app/types/user';

type AddUserModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

// Function to generate a random password
function generateTemporaryPassword() {
  const length = 8;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export default function AddUserModal({ isOpen, setIsOpen }: AddUserModalProps) {
  const queryClient = useQueryClient();
  const firstNameRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'USER' as UserRole
  });
  const [temporaryPassword, setTemporaryPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Generate a new password when the modal opens
      setTemporaryPassword(generateTemporaryPassword());
      if (firstNameRef.current) {
        firstNameRef.current.focus();
      }
    } else {
      // Reset form and password when modal closes
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'USER' as UserRole
      });
      setTemporaryPassword('');
    }
  }, [isOpen]);

  const createUserMutation = useMutation({
    mutationFn: (data: typeof formData & { password: string }) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsOpen(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate({ ...formData, password: temporaryPassword });
  };

  const actionButtons = [
    {
      variant: "white" as const,
      onClick: () => setIsOpen(false),
      children: "Cancel"
    },
    {
      variant: "primary" as const,
      type: "submit" as const,
      form: "createUserForm",
      disabled: createUserMutation.isPending,
      children: createUserMutation.isPending ? "Creating..." : "Create User"
    },
  ];

  return (
    <Modal 
      isOpen={isOpen}
      title="Create New User"
      actionButtons={actionButtons}
    >
      <form id="createUserForm" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              ref={firstNameRef}
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Temporary Password</h3>
          <div className="bg-white p-3 rounded border border-gray-300 font-mono text-center">
            {temporaryPassword}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Please save this password and share it with the user. They will be required to change it upon their first login.
          </p>
        </div>

        {createUserMutation.isError && (
          <div className="mt-2 text-red-700">
            {createUserMutation.error.message || "Failed to create user"}
          </div>
        )}
      </form>
    </Modal>
  );
} 
