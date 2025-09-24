import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Changed prop name from selectedMonth to month
function TransactionTable({ month, userId }) {
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    name: '',
    amount: '',
    category: 'Others',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = ['Shopping', 'Bills', 'Eating Out', 'Others'];

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/transactions?user_id=${userId}&month=${month}` // Use 'month'
        );
        setTransactions(response.data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };
    fetchTransactions();
  }, [month, userId]); // Dependency on 'month'

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/transactions?user_id=${userId}`,
        {
          name: newTransaction.name,
          amount: parseFloat(newTransaction.amount),
          category: newTransaction.category,
          date: newTransaction.date
        }
      );

      // Refresh transactions for the current month
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/transactions?user_id=${userId}&month=${month}` // Use 'month'
      );
      setTransactions(response.data);

      // Reset form
      setNewTransaction({
        name: '',
        amount: '',
        category: 'Others',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction');
    }
  };

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="table-wrapper">
      <form onSubmit={handleAddTransaction} className="add-transaction-form">
        <input
          type="text"
          placeholder="Transaction name"
          value={newTransaction.name}
          onChange={(e) => setNewTransaction({...newTransaction, name: e.target.value})}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={newTransaction.amount}
          onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
          required
        />
        <select
          value={newTransaction.category}
          onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input
          type="date"
          value={newTransaction.date}
          onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
          required
        />
        <button type="submit">Add</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>Category</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => (
            <tr key={transaction.id}>
              <td>{transaction.name}</td>
              <td>{transaction.date}</td>
              <td>
                <span className={`badge ${transaction.category.toLowerCase().replace(' ', '-')}`}>
                  {transaction.category}
                </span>
              </td>
              <td>${transaction.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3"><strong>Total</strong></td>
            <td><strong>${totalSpent.toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default TransactionTable;