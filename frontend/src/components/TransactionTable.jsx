import React, { useState } from 'react'; // useEffect is no longer needed here
import axios from 'axios';
import '../styles/TransactionTable.css';

// The component now receives its data and a refresh function via props
function TransactionTable({ transactions, onDataChange, month, userId, loading, error, setError }) {
  // This local state is for managing the UI (forms, editing state), which is correct.
  const [newTransaction, setNewTransaction] = useState({
    name: '',
    amount: '',
    category: 'Others',
    date: new Date().toISOString().split('T')[0]
  });

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    name: '',
    amount: '',
    category: '',
    date: ''
  });

  const categories = ['Shopping', 'Bills', 'Eating Out', 'Others'];

  // The useEffect for fetching data has been REMOVED from this component.

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
      // Instead of re-fetching, just notify the parent component.
      onDataChange();
      // Reset the form
      setNewTransaction({
        name: '',
        amount: '',
        category: 'Others',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      // Optionally set an error state managed by the parent
    }
  };

  const handleRowDoubleClick = (transaction) => {
    setEditingId(transaction.id);
    setEditData({
      name: transaction.name,
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      const payload = {
        ...editData,
        amount: parseFloat(editData.amount)
      };
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/transactions/${id}?user_id=${userId}`,
        payload
      );
      // Instead of re-fetching, just notify the parent component.
      onDataChange();
      setEditingId(null);
    } catch (error) {
      console.error('Error updating transaction:', error);
      if (error.response) {
        console.error('Backend validation errors:', error.response.data);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/transactions/${id}?user_id=${userId}`
      );
      // Instead of filtering local state, just notify the parent component.
      onDataChange();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  // This calculation now correctly uses the `transactions` prop.
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  // These checks now use the `loading` and `error` props from the parent.
  if (loading) {
    return <div className="table-wrapper">Loading transactions...</div>;
  }

  if (error) {
    return <div className="table-wrapper">{error}</div>;
  }

  // The JSX remains the same, as it now reads from the `transactions` prop.
  return (
    <div className="table-wrapper">
      <form onSubmit={handleAddTransaction} className="add-transaction-form">
        <input
          type="text"
          placeholder="Transaction name"
          value={newTransaction.name}
          onChange={(e) => setNewTransaction({ ...newTransaction, name: e.target.value })}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={newTransaction.amount}
          onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
          required
        />
        <select
          value={newTransaction.category}
          onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input
          type="date"
          value={newTransaction.date}
          onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction =>
            editingId === transaction.id ? (
              <tr key={transaction.id}>
                <td>
                  <input type="text" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                </td>
                <td>
                  <input type="date" value={editData.date} onChange={e => setEditData({ ...editData, date: e.target.value })} />
                </td>
                <td>
                  <select value={editData.category} onChange={e => setEditData({ ...editData, category: e.target.value })}>
                    {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </td>
                <td>
                  <input type="number" step="0.01" value={editData.amount} onChange={e => setEditData({ ...editData, amount: e.target.value })} />
                </td>
                <td>
                  <button className="save-btn" onClick={() => handleSaveEdit(transaction.id)}>Save</button>
                  <button className="cancel-btn" onClick={handleCancelEdit}>Cancel</button>
                </td>
              </tr>
            ) : (
              <tr key={transaction.id} onDoubleClick={() => handleRowDoubleClick(transaction)}>
                <td>{transaction.name}</td>
                <td>{transaction.date}</td>
                <td>
                  <span className={`badge ${transaction.category.toLowerCase().replace(' ', '-')}`}>
                    {transaction.category}
                  </span>
                </td>
                <td>${transaction.amount.toFixed(2)}</td>
                <td className="actions-cell">
                  <span className="icon-btn" title="Double-click row to edit">✏️</span>
                  <span
                    className="icon-btn delete-btn"
                    title="Delete transaction"
                    onClick={() => handleDeleteTransaction(transaction.id)}
                  >
                    ❌
                  </span>
                </td>
              </tr>
            )
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="4"><strong>Total</strong></td>
            <td><strong>${totalSpent.toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default TransactionTable;