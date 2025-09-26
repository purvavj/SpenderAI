import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/TransactionTable.css';

function TransactionTable({ month, userId }) {
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    name: '',
    amount: '',
    category: 'Others',
    date: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = ['Shopping', 'Bills', 'Eating Out', 'Others'];

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/transactions?user_id=${userId}&month=${month}`
        );
        setTransactions(response.data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError('Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [month, userId]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
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
        `${import.meta.env.VITE_API_URL}/api/transactions?user_id=${userId}&month=${month}`
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
      setError('Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return <div className="table-wrapper">Loading transactions...</div>;
  }

  if (error) {
    return <div className="table-wrapper">{error}</div>;
  }

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