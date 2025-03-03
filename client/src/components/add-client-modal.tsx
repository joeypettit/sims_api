import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from './modal';
import { createClient } from '../api/api';

type AddClientModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export default function AddClientModal({ isOpen, setIsOpen }: AddClientModalProps) {
  const queryClient = useQueryClient();
  const firstNameRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (isOpen && firstNameRef.current) {
      firstNameRef.current.focus();
    }
  }, [isOpen]);

  const createClientMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsOpen(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createClientMutation.mutate(formData);
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
      form: "createClientForm",
      disabled: createClientMutation.isPending,
      children: createClientMutation.isPending ? "Creating..." : "Create Client"
    },
  ];

  return (
    <Modal 
      isOpen={isOpen}
      title="Create New Client"
      actionButtons={actionButtons}
    >
      <form id="createClientForm" onSubmit={handleSubmit} className="space-y-4">
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
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600"
            />
          </div>
        </div>

        {createClientMutation.isError && (
          <div className="mt-2 text-red-700">
            {createClientMutation.error.message || "Failed to create client"}
          </div>
        )}
      </form>
    </Modal>
  );
} 