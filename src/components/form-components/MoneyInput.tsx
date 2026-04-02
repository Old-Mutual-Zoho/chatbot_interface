import React from "react";
import { NumericFormat } from "react-number-format";

interface MoneyInputProps {
  value: string | number;
  onChange: (value: string) => void;
  currency?: string;
  min?: number;
  max?: number;
  allowNegative?: boolean;
  name?: string;
  placeholder?: string;
  className?: string;
}

export const MoneyInput: React.FC<MoneyInputProps> = ({
  value,
  onChange,
  currency = "",
  min,
  max,
  allowNegative = false,
  name,
  placeholder,
  className = "",
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      {currency && <span className="mr-1 text-gray-500 select-none">{currency}</span>}
      <NumericFormat
        value={value}
        onValueChange={(values) => {
          onChange(values.value);
        }}
        thousandSeparator="," 
        allowNegative={allowNegative}
        decimalScale={2}
        name={name}
        min={min}
        max={max}
        placeholder={placeholder}
        className="border rounded px-3 py-2 w-full focus:outline-none focus:ring"
        autoComplete="off"
      />
    </div>
  );
};

export default MoneyInput;
