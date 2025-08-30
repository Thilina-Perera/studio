import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

import CustomYAxisTick from './CustomYAxisTick'; // Assuming CustomYAxisTick is in the same directory
interface ExpenseData {
  category: string; // Keep category as string
  total: number; // Change amount to total
}

interface ExpenseBarChartProps {
  data: ExpenseData[];
}

const ExpenseBarChart: React.FC<ExpenseBarChartProps> = ({ data }) => {
  // TODO: Add unit tests for ExpenseBarChart component, covering rendering with
  // empty data, data with various categories and amounts, and different sizes.

  return (
    <div className="w-full h-80"> {/* Adjust height as needed */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" type="category" />
          <YAxis tick={<CustomYAxisTick />} /> {/* Use custom tick component */}
          <Tooltip
            formatter={(value: number | string) => {
              if (typeof value === 'number') {
                return [`$${value.toFixed(2)}`, 'Amount'];
              }
              return [String(value), 'Amount']; // Handle non-numeric values in tooltip
            }}
          />
          <Bar dataKey="total" fill="#8884d8" /> {/* Use total for the bar data */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseBarChart;