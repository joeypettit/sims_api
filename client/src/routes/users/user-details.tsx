import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FaKey, FaTrash, FaUserCheck, FaUserTimes } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { deleteUser, getUser, resetUserPassword, toggleUserBlocked, updateUser } from "../../api/api";
import { UserRole } from "../../app/types/user";
import Button from "../../components/button";
import IconButton from "../../components/icon-button";
import Modal from "../../components/modal";
import PanelHeaderBar from "../../components/page-header-bar";
import ProjectsList from "../../components/projects-list";
import StatusPill from "../../components/status-pill";

const roleOptions = [
  { value: "USER", label: "User" },
  { value: "ADMIN", label: "Admin" }
];



export default function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'USER' as UserRole
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId!),
    enabled: !!userId
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: { userId: string, firstName: string, lastName: string, email: string, role: UserRole }) => 
      updateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      setIsEditing(false);
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: () => deleteUser(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      navigate("/users");
    }
  });

  const toggleBlockedMutation = useMutation({
    mutationFn: () => toggleUserBlocked(user?.userAccount?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: resetUserPassword,
    onSuccess: (data) => {
      setTemporaryPassword(data.temporaryPassword);
    }
  });

  // Initialize form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.userAccount?.email || '',
        role: user.userAccount?.role || 'USER'
      });
    }
  }, [user]);

  const startEditing = () => {
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    updateUserMutation.mutate({
      userId,
      ...formData
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.userAccount?.email || '',
        role: user.userAccount?.role || 'USER'
      });
    }
  };


  const handleResetPassword = () => {
    if (user?.userAccount?.id) {
      resetPasswordMutation.mutate(user.userAccount.id);
    }
  };

  const canModifyUser = user?.userAccount?.role !== 'SUPER_ADMIN';

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <>
      <PanelHeaderBar title={`User: ${user.firstName} ${user.lastName}`} />
      <div className="flex flex-col items-center gap-6 mt-20">
        <div className="w-full max-w-4xl mx-4">
          <div className="border border-gray-300 p-4 rounded shadow mb-6">
            <div className="flex justify-between mb-4">
              <h2 className="font-bold">User Details</h2>
              <div className="space-x-2">
                {!isEditing && canModifyUser && (
                  <>
                    <IconButton
                      icon={<FaTrash size={18} />}
                      onClick={() => setShowDeleteModal(true)}
                      color="text-gray-600 hover:text-gray-800"
                      title="Delete User"
                    />
                    <IconButton
                      icon={user.userAccount?.isBlocked ? <FaUserCheck size={20} /> : <FaUserTimes size={20} />}
                      onClick={() => toggleBlockedMutation.mutate()}
                      disabled={toggleBlockedMutation.isPending || !user?.userAccount?.id}
                      color="text-gray-600 hover:text-gray-800"
                      title={user.userAccount?.isBlocked ? "Unblock User" : "Block User"}
                    />
                    <IconButton
                      icon={<FaKey size={18} />}
                      onClick={() => setShowResetPasswordModal(true)}
                      color="text-gray-600 hover:text-gray-800"
                      title="Reset Password"
                    />
                    <IconButton
                      icon={<MdEdit size={20} />}
                      onClick={startEditing}
                      color="text-gray-600 hover:text-gray-800"
                      title="Edit User"
                    />
                  </>
                )}
              </div>
            </div>

            <div className="mb-4">
              <StatusPill variant={user.userAccount?.isBlocked ? "danger" : "success"}>
                {user.userAccount?.isBlocked ? "Blocked" : "Active"}
              </StatusPill>
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
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    disabled={!isEditing || !canModifyUser}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600 disabled:bg-gray-100"
                  >
                    {roleOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                    {user.userAccount?.role === 'SUPER_ADMIN' && (
                      <option value="SUPER_ADMIN">Super Admin</option>
                    )}
                  </select>
                  {!canModifyUser && (
                    <p className="mt-1 text-sm text-gray-500">
                      Super Admin role cannot be modified
                    </p>
                  )}
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
                    disabled={updateUserMutation.isPending}
                  >
                    {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}

              {updateUserMutation.isError && (
                <div className="text-red-600 text-center">
                  {updateUserMutation.error.message || "Error updating user"}
                </div>
              )}
            </form>
          </div>

          {/* Projects List */}
          <ProjectsList projects={user.projects || []} />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        title="Delete User"
        actionButtons={[
          {
            variant: "white",
            onClick: () => setShowDeleteModal(false),
            children: "Cancel"
          },
          {
            variant: "danger",
            onClick: () => deleteUserMutation.mutate(),
            disabled: deleteUserMutation.isPending,
            children: deleteUserMutation.isPending ? "Deleting..." : "Delete"
          }
        ]}
      >
        <div className="space-y-4 text-left">
          <p className="text-red-600 font-medium">Warning: This action cannot be undone!</p>
          <p>Deleting this user will:</p>
          <ul className="list-disc pl-5 text-gray-600">
            <li>Permanently remove their account</li>
            <li>Remove them from all associated projects</li>
            <li>Delete all their system access</li>
          </ul>
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200 mt-2">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">Consider blocking instead:</span> Blocking the user will prevent them from logging in while preserving their project history and associations. You can unblock them later if needed.
            </p>
          </div>
          {deleteUserMutation.isError && (
            <p className="text-red-600 mt-2">
              {deleteUserMutation.error.message || "Error deleting user"}
            </p>
          )}
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={showResetPasswordModal}
        title="Reset User Password"
        onCancel={temporaryPassword ? undefined : () => {
          setShowResetPasswordModal(false);
          setTemporaryPassword(null);
        }}
        onConfirm={temporaryPassword ? undefined : handleResetPassword}
        disableConfirm={resetPasswordMutation.isPending}
        actionButtons={temporaryPassword ? [
          {
            variant: "white",
            onClick: () => {
              setShowResetPasswordModal(false);
              setTemporaryPassword(null);
            },
            children: "Close"
          }
        ] : undefined}
      >
        {temporaryPassword ? (
          <div className="space-y-4">
            <p>The user's password has been reset. Their temporary password is:</p>
            <div className="bg-gray-100 p-3 rounded font-mono text-center">
              {temporaryPassword}
            </div>
            <p className="text-sm text-gray-600">
              Please provide this password to the user. They will be required to change it upon their next login.
            </p>
          </div>
        ) : (
          <p>Are you sure you want to reset this user's password? They will be required to change it upon their next login.</p>
        )}
      </Modal>
    </>
  );
} 