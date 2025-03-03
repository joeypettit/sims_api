import { useState } from "react";

export default function QuantityInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (newValue: number) => void;
}) {
  const [inputValue, setInputValue] = useState(value.toFixed(2));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(newValue)) {
      setInputValue(newValue);
      onChange(parseFloat(newValue) || 0);
    }
  };

  const increment = () => {
    const newValue = Math.floor(Number(inputValue)) + 1;
    setInputValue(newValue.toFixed(2));
    onChange(newValue);
  };

  const decrement = () => {
    if (Number(inputValue) - 1 < 0) return;
    const newValue = Math.floor(Number(inputValue)) - 1;
    setInputValue(newValue.toFixed(2));
    onChange(newValue);
  };

  return (
    <div className="flex p-1 items-center w-18 bg-white border border-gray-300 rounded overflow-hidden">
      <button
        type="button"
        className="flex-shrink-0 text-sims-green-900 hover:text-sims-green-600 hover:shadow-inner focus:outline-none px-1 flex justify-center items-center"
        onClick={decrement}
      >
        &ndash;
      </button>
      <input
        type="text"
        autoComplete="off"
        value={inputValue}
        id="quantity"
        name="quantity"
        onChange={handleInputChange}
        className="w-full text-center bg-transparent focus:outline-none border-none"
      />
      <button
        type="button"
        className="flex-shrink-0 text-sims-green-900 hover:text-sims-green-600 hover:shadow-inner focus:outline-none px-1 flex justify-center items-center"
        onClick={increment}
      >
        +
      </button>
    </div>
  );
}
