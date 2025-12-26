import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { NumericFormat } from "react-number-format";
import { getProjectAreaById, updateAllLineItemMarginsInArea } from "../../api/api";
import PanelHeaderBar from "../../components/page-header-bar";
import SimsSpinner from "../../components/sims-spinner/sims-spinner";
import Button from "../../components/button";
import Modal from "../../components/modal";
import type { ButtonProps } from "../../components/button";

export default function ProjectAreaSettings() {
  const { id: projectId, areaId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [marginPercentage, setMarginPercentage] = useState<number | undefined>(undefined);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [marginInputError, setMarginInputError] = useState<string | null>(null);

  const projectAreaQuery = useQuery({
    queryKey: ["area", areaId],
    queryFn: async () => {
      if (!areaId) {
        throw new Error("Area ID is required");
      }
      const response = await getProjectAreaById(areaId);
      return response;
    },
    enabled: !!areaId,
  });

  // Count total line items across all groups
  const totalLineItemsCount = useMemo(() => {
    if (!projectAreaQuery.data?.lineItemGroups) return 0;
    return projectAreaQuery.data.lineItemGroups.reduce((total, group) => {
      return total + (group.lineItems?.length || 0);
    }, 0);
  }, [projectAreaQuery.data?.lineItemGroups]);

  const handleMarginInputChange = (values: { floatValue: number | undefined }) => {
    const value = values.floatValue;
    setMarginInputError(null);
    
    if (value === undefined) {
      setMarginPercentage(undefined);
      return;
    }

    if (value < 0 || value > 100) {
      setMarginInputError("Margin must be between 0% and 100%");
      setMarginPercentage(undefined);
      return;
    }

    setMarginPercentage(value);
  };

  const handleUpdateMarginClick = () => {
    if (marginPercentage === undefined) {
      setMarginInputError("Please enter a margin percentage");
      return;
    }

    if (marginPercentage < 0 || marginPercentage > 100) {
      setMarginInputError("Margin must be between 0% and 100%");
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const updateMarginsMutation = useMutation({
    mutationFn: async (marginPercentage: number) => {
      if (!areaId) {
        throw new Error("Area ID is required");
      }
      return await updateAllLineItemMarginsInArea({
        areaId,
        marginPercentage,
      });
    },
    onSuccess: () => {
      setIsConfirmModalOpen(false);
      setMarginPercentage(undefined);
      setMarginInputError(null);
      // Invalidate area query to refetch with updated margins
      queryClient.invalidateQueries({ queryKey: ["area", areaId] });
      // Also invalidate area cost query since margins affect pricing
      queryClient.invalidateQueries({ queryKey: ["area-cost", areaId] });
      // Invalidate project cost if we have projectId
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["project-cost", projectId] });
      }
    },
    onError: (error: Error) => {
      setMarginInputError(error.message || "Failed to update margins. Please try again.");
    },
  });

  const handleConfirmUpdate = () => {
    if (marginPercentage === undefined) {
      setMarginInputError("Please enter a margin percentage");
      return;
    }
    updateMarginsMutation.mutate(marginPercentage);
  };

  const handleCancelUpdate = () => {
    setIsConfirmModalOpen(false);
  };

  if (projectAreaQuery.isLoading) {
    return <SimsSpinner />;
  }

  if (projectAreaQuery.isError || !projectAreaQuery.data) {
    return (
      <div className="p-4">
        <p className="text-red-600">Error loading project area settings.</p>
      </div>
    );
  }

  const areaName = projectAreaQuery.data.name || "Unnamed Area";

  const actionButtons: ButtonProps[] = [
    {
      variant: "white",
      onClick: handleCancelUpdate,
      disabled: updateMarginsMutation.isPending,
      children: "Cancel",
    },
    {
      variant: "primary",
      onClick: handleConfirmUpdate,
      disabled: updateMarginsMutation.isPending,
      children: updateMarginsMutation.isPending ? "Updating..." : "Update All Margins",
    },
  ];

  return (
    <>
      <PanelHeaderBar title={`Settings: ${areaName}`} />
      <div className="flex flex-col items-center gap-6 mt-20">
        <div className="w-full max-w-4xl mx-4">
          <div className="border border-gray-300 p-4 rounded shadow mb-6">
            <h2 className="font-bold text-lg mb-4">Project Area Settings</h2>
            <p className="text-gray-600 mb-6">
              Settings for project area: <strong>{areaName}</strong>
            </p>

            {/* Update All Margins Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-md mb-2">Update All Line Item Margins</h3>
              <p className="text-sm text-gray-600 mb-4">
                Set the margin percentage for all line items in this project area at once.
              </p>
              
              <div className="flex items-end gap-4">
                <div className="flex-1 max-w-xs">
                  <label
                    htmlFor="margin-percentage"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Margin Percentage
                  </label>
                  <NumericFormat
                    id="margin-percentage"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600"
                    autoComplete="off"
                    suffix="%"
                    value={marginPercentage}
                    allowNegative={false}
                    decimalScale={2}
                    placeholder="e.g., 52.00"
                    onValueChange={handleMarginInputChange}
                  />
                  {marginInputError && (
                    <p className="mt-1 text-sm text-red-600">{marginInputError}</p>
                  )}
                </div>
                <Button
                  variant="primary"
                  onClick={handleUpdateMarginClick}
                  disabled={marginPercentage === undefined || marginPercentage < 0 || marginPercentage > 100}
                >
                  Update All Margins
                </Button>
              </div>

              {totalLineItemsCount > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  This will update {totalLineItemsCount} line item{totalLineItemsCount !== 1 ? 's' : ''} in this area.
                </p>
              )}
            </div>

            <div className="mt-6">
              <Button
                variant="white"
                onClick={() => navigate(`/project/${projectId}/area/${areaId}`)}
              >
                Back to Area
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        title="Update All Line Item Margins"
        actionButtons={actionButtons}
      >
        <div className="space-y-4 text-left">
          <p className="text-gray-700 font-medium">
            Are you sure you want to update all line item margins to <strong>{marginPercentage}%</strong>?
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-yellow-800 font-semibold text-sm mb-2">Warning: This action will:</p>
            <ul className="list-disc pl-5 text-sm text-yellow-700">
              <li>Update the margin for all {totalLineItemsCount} line item{totalLineItemsCount !== 1 ? 's' : ''} in this area</li>
              <li>Recalculate all option prices based on the new margin</li>
              <li>Affect all three pricing tiers (Premier, Designer, Luxury)</li>
            </ul>
          </div>
          <p className="text-sm text-gray-600">
            This action cannot be undone. You will need to manually adjust individual line items if you want to revert specific changes.
          </p>
          {updateMarginsMutation.isError && (
            <div className="text-red-600 mt-2">
              Error: {updateMarginsMutation.error?.message || "Failed to update margins"}
            </div>
          )}
          {updateMarginsMutation.isPending && (
            <div className="mt-2">
              <SimsSpinner centered withLogo={false} />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

