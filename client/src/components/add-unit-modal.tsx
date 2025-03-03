import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { validateUnitName } from "../util/form-validation";
import { createUnit } from "../api/api";
import Modal from "./modal";

type AddUnitModalProps = {
  isOpen: boolean;
  onConfirm: (unitName: string) => void;
  onCancel: () => void;
  errorMessage?: string;
};

export default function AddUnitModal({
  isOpen,
  onConfirm,
  onCancel,
  errorMessage
}: AddUnitModalProps) {
  const queryClient = useQueryClient();
  const [unitNameInput, setUnitNameInput] = useState("");
  const [validationError, setValidationError] = useState<string>("");
  const unitInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && unitInputRef.current) {
      unitInputRef.current.focus();
    }
  }, [isOpen]);

  const handleConfirm = () => {
    setValidationError("");
    const error = validateUnitName(unitNameInput);
    if (error) {
      setValidationError(error);
      return;
    }
    const trimmedName = unitNameInput.trim();
    onConfirm(trimmedName);
    setUnitNameInput("");
  };

  const handleCancel = () => {
    setUnitNameInput("");
    setValidationError("");
    onCancel();
  };

  const createUnitMutation = useMutation({
    mutationFn: createUnit,
    onError: () => {
      setValidationError(
        "There has been an error creating a new unit. Please try again."
      );
    },
    onSuccess: (data) => {
      console.log("Unit Created with id", data.id);
      queryClient.invalidateQueries({ queryKey: ["units"] });
      setUnitNameInput("");
      onCancel();
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      title="Add New Unit"
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    >
      <div className="flex flex-col justify-center items-center">
        <p className="text-sm text-gray-500 pb-4">
          Enter a name for the new unit (e.g., "Square Feet", "Hours", "Each").
        </p>
        <label htmlFor="unitName" className="block mb-2">
          Unit Name:
        </label>
        <input
          type="text"
          autoComplete="off"
          id="unit-name"
          name="unit-name"
          ref={unitInputRef}
          value={unitNameInput}
          onChange={(e) => setUnitNameInput(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600"
        />
        {(validationError || errorMessage) && (
          <div className="mt-2 text-rose-700">{validationError || errorMessage}</div>
        )}
      </div>
    </Modal>
  );
}
