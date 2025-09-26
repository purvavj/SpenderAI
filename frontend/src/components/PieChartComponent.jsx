import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import '../styles/PieChart.css';

const COLORS = ['#ff9292ff', '#e6a157', '#f0e1d4ff', '#FF7F7F', '#A91101', '#0d97baa7'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, percent, index }) => {
  return null;
};

export default function PieChartComponent({ month, userId }) {
  const [loading, setLoading] = useState(true);
  const [breakdown, setBreakdown] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null); // hovered slice

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
    <div className="chart-container" style={{ width: '100%', height: '340px', position: 'relative' }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            cornerRadius={8}
            dataKey="value"
            labelLine={false}
            label={renderCustomizedLabel}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="rgba(202, 199, 131, 1)"
                strokeWidth={1}
              />
            ))}
          </Pie>

          <Legend
            layout="horizontal"
            align="center"
            verticalAlign="top"
            wrapperStyle={{ paddingTop: '8px' }}
            iconType="circle"
            formatter={(value) => {
              const i = chartData.findIndex(item => item.name === value);
              return <span style={{ color: COLORS[i % COLORS.length] || '#000', fontWeight: 600 }}>{value}</span>;
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center hover label (keep this section) */}
      {activeIndex !== null && chartData[activeIndex] && (
        <div className="pie-center-label">
          <div className="pie-center-value">${(chartData[activeIndex].value || 0).toFixed(2)}</div>
          <div className="pie-center-name">{chartData[activeIndex].name}</div>
          <div className="pie-center-percent">{total ? `${Math.round((chartData[activeIndex].value / total) * 100)}%` : ''}</div>
        </div>
      )}

      <div className="chart-total">Total: ${total.toFixed(2)}</div>
    </div>
  );
}