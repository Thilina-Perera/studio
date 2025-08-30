import React from 'react';

interface CustomYAxisTickProps {
  x?: number;
  y?: number;
  payload?: { value: string | number };
}

const CustomYAxisTick: React.FC<CustomYAxisTickProps> = ({ x, y, payload }) => {
  const value = payload?.value;
  let formattedValue = '';

  if (typeof value === 'number') {
    formattedValue = `$${value.toFixed(2)}`;
  } else if (typeof value === 'string') {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      formattedValue = `$${numValue.toFixed(2)}`;
    }
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" fill="#666" fontSize={12}>
        {formattedValue}
      </text>
    </g>
  );
};

export default CustomYAxisTick;