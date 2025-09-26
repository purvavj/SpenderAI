import React, { useState, useRef, useEffect } from 'react'; // Add useRef and useEffect for outside click handling
import TransactionTable from './TransactionTable';
import PieChartComponent from './PieChartComponent';
import '../styles/Dashboard.css';
import '../styles/Navbar.css';

function Dashboard({ user, setIsLoggedIn }) {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [showDropdown, setShowDropdown] = useState(false); // State for dropdown visibility
  const dropdownRef = useRef(null); // Ref to detect outside clicks

  const handleLogout = () => {
    setShowDropdown(false); // Close dropdown
    localStorage.removeItem('spender_user');
    setIsLoggedIn(false);
  };

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle dropdown on profile click
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const years = Array.from({ length: 2030 - 2024 + 1 }, (_, i) => 2024 + i);
  
  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ];

  const formattedMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  return (
    <div className="dashboard">
      {/* Navigation Bar */}
      <nav className="navbar">
        <h1 className="nav-title">Spender AI</h1>
        <div className="nav-profile" onClick={toggleDropdown} ref={dropdownRef}>
          <span className="profile-name">{user.name}</span>
          <img src={user.picture} alt={user.name} className="profile-pic" />
          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="profile-dropdown">
              <button onClick={handleLogout} className="dropdown-item">
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Month/Year Selector */}
      <div className="dashboard-header-controls">
        <div className="month-year-selector">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dashboard Content */}
      <main className="dashboard-content">
        {/* Left Section - Pie Chart */}
        <div className="left-section card">
          <div className="chart-container">
            <h3 className="chart-title">Spending by Category for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</h3>
            <PieChartComponent month={formattedMonth} userId={user.id} />
          </div>
        </div>

        {/* Right Section - Transaction Table */}
        <div className="right-section card">
          <h3 className="table-title">Transactions for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</h3>
          <TransactionTable month={formattedMonth} userId={user.id} />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;