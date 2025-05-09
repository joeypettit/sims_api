import { useQuery } from "@tanstack/react-query";
import type { PanelTableColumn } from "../../components/panel-table";
import PanelTable from "../../components/panel-table";
import { searchClients } from "../../api/api";
import { useNavigate } from "react-router-dom";
import { Client } from "../../app/types/client";
import { useState } from "react";
import Button from "../../components/button";
import { FaChevronLeft, FaChevronRight, FaPlus } from "react-icons/fa6";
import AddClientModal from "../../components/add-client-modal";
import { useDebounce } from "../../hooks/useDebounce";
import SimsSpinner from "../../components/sims-spinner/sims-spinner";

export default function ClientsPanel() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const limit = "10";
  
  // Query for clients with search
  const { data, isLoading } = useQuery({
    queryKey: ["clients", "search", debouncedSearch, currentPage],
    queryFn: () => searchClients({ 
      query: debouncedSearch, 
      page: currentPage, 
      limit 
    })
  });

  const handleRowClick = (client: Client) => {
    navigate(`/clients/${client.id}`);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage.toString());
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage("1"); // Reset to first page on new search
  };

  const columns: PanelTableColumn<Client>[] = [
    {
      columnName: "Name",
      orderIndex: 1,
      cellRenderer: (client) => `${client.firstName} ${client.lastName}`
    },
    {
      columnName: "Email",
      orderIndex: 2,
      cellRenderer: (client) => client.email || "-"
    },
    {
      columnName: "Phone",
      orderIndex: 3,
      cellRenderer: (client) => client.phone || "-"
    },
    {
      columnName: "Projects",
      orderIndex: 4,
      cellRenderer: (client) => client.projects?.length || 0
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search clients..."
          value={searchQuery}
          onChange={handleSearch}
          className="px-4 py-2 border rounded-lg"
        />
        <Button variant="white" onClick={() => setIsAddClientModalOpen(true)}>
          <FaPlus />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <SimsSpinner centered />
        </div>
      ) : !data ? (
        <div className="text-center py-4 text-gray-500">Error loading clients</div>
      ) : data.clients.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          {searchQuery ? "No clients found matching your search" : "No clients found"}
        </div>
      ) : (
        <>
          <PanelTable
            data={data.clients}
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

      <AddClientModal
        isOpen={isAddClientModalOpen}
        setIsOpen={setIsAddClientModalOpen}
      />
    </div>
  );
} 