import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, updateUser, logout } from "../../api/api";
import { useState, useEffect } from "react";
import Button from "../../components/button";
import IconButton from "../../components/icon-button";
import PanelHeaderBar from "../../components/page-header-bar";
import { MdEdit } from "react-icons/md";
import { UserRole } from "../../app/types/user";
import { useNavigate } from "react-router-dom";
import { FaKey, FaSignOutAlt } from "react-icons/fa";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: { userId: string, firstName: string, lastName: string, email: string, role: UserRole }) => 
      updateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setIsEditing(false);
    }
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      navigate('/login');
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.userAccount?.email || '',
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    updateUserMutation.mutate({
      userId: user.id,
      ...formData,
      role: user.userAccount?.role || 'USER'
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.userAccount?.email || '',
      });
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <>
      <PanelHeaderBar title="My Profile" />
      <div className="flex flex-col items-center gap-6 mt-20">
        <div className="w-full max-w-4xl mx-4">
          <div className="border border-gray-300 p-4 rounded shadow mb-6">
            <div className="flex justify-between mb-4">
              <h2 className="font-bold">Profile Details</h2>
              <div className="space-x-2">
                {!isEditing && (
                  <>
                    <IconButton
                      icon={<FaKey size={18} />}
                      onClick={() => navigate('/change-password')}
                      color="text-gray-600 hover:text-gray-800"
                      title="Change Password"
                    />
                    <IconButton
                      icon={<MdEdit size={20} />}
                      onClick={() => setIsEditing(true)}
                      color="text-gray-600 hover:text-gray-800"
                      title="Edit Profile"
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
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={user.userAccount?.role || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
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
                    disabled={updateUserMutation.isPending}
                  >
                    {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}

              {updateUserMutation.isError && (
                <div className="text-red-600 text-center">
                  {updateUserMutation.error.message || "Error updating profile"}
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="flex justify-center w-full">
          <Button
            variant="outline-danger"
            onClick={handleLogout}
            className="flex items-center gap-2 border-red-200 text-red-500 hover:bg-red-50"
          >
            <FaSignOutAlt /> Logout
          </Button>
        </div>
      </div>
    </>
  );
} 