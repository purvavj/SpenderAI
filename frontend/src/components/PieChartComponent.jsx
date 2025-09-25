import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import '../styles/PieChart.css';

// Modern color palette
const COLORS = ['#54a5d7ff', '#C4B4E6', '#FFDC73', '#FF7878', '#A0D8B4', '#8B80C8'];

// Custom label (value + % outside the ring)
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, percent, index }) => {
  if (!value || value <= 0) return null;
  const RADIAN = Math.PI / 180;
  const outerX = cx + (outerRadius + 30) * Math.cos(-midAngle * RADIAN);
  const outerY = cy + (outerRadius + 30) * Math.sin(-midAngle * RADIAN);
  const textAnchor = outerX > cx ? 'start' : 'end';

  return (
    <g>
      <text x={outerX} y={outerY} fill={COLORS[index % COLORS.length]} textAnchor={textAnchor} dominantBaseline="central" fontSize="14">
        {value}
      </text>
      <text x={outerX} y={outerY + 20} fill={COLORS[index % COLORS.length]} textAnchor={textAnchor} fontSize="12" opacity="0.8">
        {(percent * 100).toFixed(0)}%
      </text>
    </g>
  );
};

function PieChartComponent({ month, userId }) {
  const [loading, setLoading] = useState(true);
  const [breakdown, setBreakdown] = useState([]);

  useEffect(() => {
    if (!userId || !month) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard`, {
          params: { user_id: userId, month }
        });
        const arr = Array.isArray(data?.category_breakdown) ? data.category_breakdown : [];
        setBreakdown(arr);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setBreakdown([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month, userId]);

  if (loading) return <div className="pie-chart-placeholder">Loading chart data...</div>;

  const safe = breakdown.filter(item => (item?.amount ?? 0) > 0);
  if (safe.length === 0) return <div className="pie-chart-placeholder">No spending data for this month</div>;

  const chartData = safe.map(item => ({ name: item.category || 'Other', value: item.amount }));
  const total = chartData.reduce((sum, e) => sum + (e.value || 0), 0);

  return (
    <div className="chart-container" style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={2}
            cornerRadius={10}
            dataKey="value"
            labelLine={false}
            label={renderCustomizedLabel}
            isAnimationActive={false}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="#202030"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Legend
            layout="horizontal"
            align="center"
            verticalAlign="top"
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="circle"
            formatter={(value) => {
              const i = chartData.findIndex(item => item.name === value);
              return <span style={{ color: COLORS[i % COLORS.length] || '#ccc', fontWeight: 500 }}>{value}</span>;
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="chart-total" style={{ textAlign: 'center', marginTop: 20, fontSize: '1.1rem', fontWeight: 600, color: '#e0e0e0' }}>
        Total: ${total.toFixed(2)}
      </div>
    </div>
  );
}

export default PieChartComponent;