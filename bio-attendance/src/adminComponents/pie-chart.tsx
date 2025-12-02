import { Cell, Pie, PieChart, Tooltip, ResponsiveContainer } from "recharts";
import React from 'react';
interface Approved{
        orders:number,
        products:number
}
const Pie_chart = ({orders,products}:Approved) => {
  const data = [
    { name: 'products', value: products },
    { name: 'orders', value: orders },
  ];
  
  const COLORS = ['#0088FE', '#00C49F'];
  
  return (
    <div className="w-full h-96 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          >
            {data.map((enry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [`${value}`, name]}
            labelStyle={{ color: '#374151' }}
            contentStyle={{ 
              backgroundColor: '#f9fafb', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Pie_chart;