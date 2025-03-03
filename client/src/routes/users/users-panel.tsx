import { useQuery } from "@tanstack/react-query";
import type { PanelTableColumn } from "../../components/panel-table";
import PanelTable from "../../components/panel-table";
import { searchUsers, getCurrentUser } from "../../api/api";
import { useNavigate } from "react-router-dom";
import { User } from "../../app/types/user";
import { useState } from "react";
import Button from "../../components/button";
import { FaChevronLeft, FaChevronRight, FaPlus } from "react-icons/fa6";
import AddUserModal from "../../components/add-user-modal";
import StatusPill from "../../components/status-pill";
import { useDebounce } from "../../hooks/useDebounce";
import { useUserRole } from "../../hooks/useUserRole";

const formatRole = (role: string) => {
  if (role === 'SUPER_ADMIN') return 'Super Admin';
  return role.charAt(0) + role.slice(1).toLowerCase();
};

export default function UsersPanel() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const limit = "10";
  
  // Add query for current user
  const { data: currentUser } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser
  });
  
  // Query for users with search and filter out current user
  const { data, isLoading } = useQuery({
    queryKey: ["users", "search", debouncedSearch, currentPage],
    queryFn: () => searchUsers({ 
      query: debouncedSearch, 
      page: currentPage, 
      limit 
    }),
    select: (data) => ({
      ...data,
      users: data.users.filter(user => user.id !== currentUser?.id)
    })
  });

  const handleRowClick = (user: User) => {
    navigate(`/users/${user.id}`);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage.toString());
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage("1"); // Reset to first page on new search
  };

  const columns: PanelTableColumn<User>[] = [
    {
      columnName: "Name",
      orderIndex: 1,
      cellRenderer: (user) => `${user.firstName} ${user.lastName}`
    },
    {
      columnName: "Email",
      orderIndex: 2,
      cellRenderer: (user) => user.userAccount?.email
    },
    {
      columnName: "Role",
      orderIndex: 3,
      cellRenderer: (user) => formatRole(user.userAccount?.role || '')
    },
    {
      columnName: "Status",
      orderIndex: 4,
      cellRenderer: (user) => (
        <StatusPill variant={user.userAccount?.isBlocked ? "danger" : "success"}>
          {user.userAccount?.isBlocked ? "Blocked" : "Active"}
        </StatusPill>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={handleSearch}
          className="px-4 py-2 border rounded-lg"
        />
        <Button variant="white" onClick={() => setIsAddUserModalOpen(true)}>
          <FaPlus />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">Loading users...</div>
      ) : !data ? (
        <div className="text-center py-4 text-gray-500">Error loading users</div>
      ) : data.users.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          {searchQuery ? "No users found matching your search" : "No users found"}
        </div>
      ) : (
        <>
          <PanelTable
            data={data.users}
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

      <AddUserModal
        isOpen={isAddUserModalOpen}
        setIsOpen={setIsAddUserModalOpen}
      />
    </div>
  );
} 