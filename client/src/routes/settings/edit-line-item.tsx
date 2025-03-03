import { useState, useEffect } from "react";
import type { LineItemOption } from "../../app/types/line-item-option";
import { useParams } from "react-router-dom";
import type { LineItemUnit } from "../../app/types/line-item-unit";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import UnitSelector from "../../components/unit-selector";
import QuantityInput from "../../components/quantity-input";
import type { LineItem } from "../../app/types/line-item";
import SimsSpinner from "../../components/sims-spinner/sims-spinner";
import { getLineItem } from "../../api/api";
import OptionForm from "./option-form";
import { updateLineItem } from "../../api/api";
import Button from "../../components/button";
import { NumericFormat } from "react-number-format";
import { ProjectArea } from "../../app/types/project-area";

import PanelHeaderBar from "../../components/page-header-bar";

export default function EditLineItem() {
  const queryClient = useQueryClient();
  const { lineItemId } = useParams();
  const [formData, setFormData] = useState<LineItem | undefined>(undefined);

  const lineItemQuery = useQuery({
    queryKey: ["line-item", lineItemId],
    queryFn: async () => {
      console.log("REFETCHING");
      if (!lineItemId) {
        throw Error("Line Item Id is required.");
      }
      const result = await getLineItem(lineItemId);
      console.log("result is", result);
      return result;
    },
    staleTime: Infinity,
    refetchOnMount: "always",
  });

  const updateLineItemMutation = useMutation({
    mutationFn: updateLineItem,
    onError: (error) => {
      console.log("error updating line item", error);
    },
    onSuccess: () => {
      window.history.back();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["line-item", lineItemId] });
      queryClient.invalidateQueries({ queryKey: ["area-template"] });
      // Also invalidate cost queries since margin affects pricing
      const projectAreaId = lineItemQuery.data?.projectAreaId;
      if (projectAreaId) {
        queryClient.invalidateQueries({
          queryKey: ["area-cost", projectAreaId],
        });
        // Get the project area to find the project ID
        const projectArea = queryClient.getQueryData([
          "area",
          projectAreaId,
        ]) as ProjectArea;
        if (projectArea?.projectId) {
          queryClient.invalidateQueries({
            queryKey: ["project-cost", projectArea.projectId],
          });
        }
      }
    },
  });

  // Handle input changes
  function onNameInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    if (formData) {
      setFormData({ ...formData, name: value });
    }
  }

  function onQuantityChange(newValue: number) {
    if (formData) {
      setFormData({ ...formData, quantity: newValue });
    }
  }

  function onUnitSelection(selectedUnit: LineItemUnit) {
    if (formData) {
      setFormData({ ...formData, unit: { ...selectedUnit } });
    }
  }

  function onOptionChange(updatedOption: LineItemOption) {
    const updatedFormData = structuredClone(formData);
    const index = updatedFormData?.lineItemOptions.findIndex((o) => {
      return o.id === updatedOption.id;
    });
    if (index == -1 || index == undefined || !updatedFormData) {
      throw Error("Cannot identify option to update");
    }
    updatedFormData.lineItemOptions[index] = updatedOption;
    setFormData(updatedFormData);
  }

  function onMarginInputChange(value: number | undefined) {
    if (formData) {
      const updatedFormData = structuredClone(formData);
      let valueAsDecimal = value ? value / 100 : undefined;
      updatedFormData.marginDecimal = valueAsDecimal;
      setFormData(updatedFormData);
    }
  }

  function getMarginPercentage() {
    const marginDecimal = formData?.marginDecimal;
    return marginDecimal ? marginDecimal * 100 : undefined;
  }

  function validateForm() {
    if (!formData) {
      throw Error("Form Data is undefined");
    }
    const validatedFormData = structuredClone(formData);
    validatedFormData?.lineItemOptions.forEach((option: LineItemOption) => {
      if (option.priceAdjustmentMultiplier == undefined) {
        option.priceAdjustmentMultiplier = 1;
      }
    });
    if (validatedFormData?.marginDecimal == undefined) {
      validatedFormData.marginDecimal = 0;
    }
    return validatedFormData;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validatedForm = validateForm();
    if (lineItemId) {
      updateLineItemMutation.mutate({
        lineItemId: lineItemId,
        groupId: validatedForm?.lineItemGroupId,
        marginDecimal: validatedForm?.marginDecimal,
        name: validatedForm?.name,
        quantity: validatedForm?.quantity,
        unitId: validatedForm?.unit?.id,
        lineItemOptions: validatedForm?.lineItemOptions,
      });
    }
  }

  function handleCancel() {
    setFormData(undefined);
    window.history.back();
  }
  useEffect(() => {
    console.log("use effect", lineItemQuery.data, formData);
    // prepopulate local state for form
    if (lineItemQuery.data != undefined && formData == undefined) {
      console.log("setting data", lineItemQuery.data, formData);
      setFormData(lineItemQuery.data);
    }
  }, [lineItemQuery.data, formData]);

  if (!formData) {
    return (
      <>
        <div className="flex justify-center items-center w-full h-full">
          <SimsSpinner centered />
        </div>
      </>
    );
  }
  return (
    <>
      <PanelHeaderBar
        title={`Editing Line Item: ${lineItemQuery.data?.name}`}
      />
      <div className="flex flex-col items-center gap-6 mt-8 ">
        <div className="w-full max-w-4xl ">
          <div className="p-4 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4 px-2">
              <div className="border border-gray-300 p-4 rounded shadow">
                <div className="flex justify-between">
                  <h2 className="font-bold">Line Item Details</h2>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      autoComplete="off"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={onNameInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="marginDecimal"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Margin
                    </label>
                    <NumericFormat
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600"
                      autoComplete="off"
                      id="priceAdjustmentMultiplier"
                      name="priceAdjustmentMultiplier"
                      suffix="%"
                      value={getMarginPercentage()}
                      allowNegative={false}
                      decimalScale={2}
                      placeholder="Percent Margin"
                      onValueChange={(values) => {
                        onMarginInputChange(values.floatValue);
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="quantity"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Quantity
                    </label>
                    <QuantityInput
                      value={formData.quantity || 0}
                      onChange={onQuantityChange}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={"unit"}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Unit
                    </label>
                    <UnitSelector
                      value={formData?.unit?.id || ""}
                      onChange={onUnitSelection}
                    />
                  </div>
                </div>
                </div>


                <div className="pt-4 border border-gray-300 p-4 rounded shadow">
                  <h2 className="font-bold text-gray-700">
                    Options
                  </h2>
                  <div className="">
                    {formData.lineItemOptions
                      .sort((a: LineItemOption, b: LineItemOption) => {
                        if (a.optionTier.tierLevel > b.optionTier.tierLevel)
                          return 1;
                        if (a.optionTier.tierLevel < b.optionTier.tierLevel)
                          return -1;
                        return 0;
                      })
                      .map((option, index, array) => {
                        return (
                          <div
                            key={option.id}
                            className={`pt-4 ${index < array.length - 1 ? "border-b-2 border-gray-200" : ""}`}
                          >
                            <OptionForm
                              key={option.id}
                              option={option}
                              lineItem={formData}
                              onChange={onOptionChange}
                            />
                          </div>
                        );
                      })}
                  </div>
                </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="white" type="button" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={updateLineItemMutation.isPending}
                >
                  {updateLineItemMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
