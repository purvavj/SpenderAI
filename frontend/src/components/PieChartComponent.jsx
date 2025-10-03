import React, { useState } from 'react'; // useEffect and axios are no longer needed here
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import '../styles/PieChart.css';

const COLORS = ['#ff9292ff', '#e6a157', '#f0e1d4ff', '#8751abff', '#0d97baa7'];

// This helper function can remain as it is
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, percent, index }) => {
  return null;
};

// The component now receives its data via props
export default function PieChartComponent({ dashboardData, loading }) {
  // Local state for UI interactions (like hovering) is perfectly fine here.
  const [activeIndex, setActiveIndex] = useState(null);

  // The useEffect for fetching data has been REMOVED.

  // The component now uses the `loading` prop from the parent.
  if (loading) {
    return <div className="pie-chart-placeholder">Loading chart data...</div>;
  }

  // It now safely unwraps the `dashboardData` prop.
  const breakdown = Array.isArray(dashboardData?.category_breakdown) ? dashboardData.category_breakdown : [];
  
  // This logic remains the same but now operates on the derived `breakdown` variable.
  const safe = breakdown.filter(item => (item?.amount ?? 0) > 0);
  if (safe.length === 0) {
    return <div className="pie-chart-placeholder">No spending data for this month</div>;
  }

  const chartData = safe.map(item => ({ name: item.category || 'Other', value: item.amount }));
  const total = chartData.reduce((sum, e) => sum + (e.value || 0), 0);

  // The entire JSX rendering part remains unchanged.
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
                stroke="rgba(0, 0, 0, 1)"
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