import React from 'react';
import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';

interface ExpenseData {
  category: string;
  total: number;
}

interface ExpensePieChartProps {
  data: ExpenseData[];
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6384',
  '#36A2EB', '#FFCE56', '#4BC0C0', '#9966CC', '#FF9F40'
];

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ data }) => {
  // TODO: Add comprehensive unit tests for rendering the chart with various data inputs (empty data, single item, multiple items)

  // TODO: Add unit tests for ExpensePieChart

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="total"
            label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => {
            if (typeof value === 'number') {
              return [`$${value.toFixed(2)}`, 'Amount'];
            }
            return value; // Return original value if not a number
          }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpensePieChart;