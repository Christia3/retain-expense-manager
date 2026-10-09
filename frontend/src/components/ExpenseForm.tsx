
import { useState, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import {
  createExpenseThunk,
  updateExpenseThunk,
} from '../redux/expenseSlice';

import type { RootState, AppDispatch } from '../redux/store';
import type { Expense, PaymentMethod } from '../types/expense';

function ExpenseForm() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const categories = useSelector(
    (state: RootState) => state.categories.categories
  );

  const existingExpense = useSelector(
    (state: RootState) =>
      state.expenses.expenses.find((expense) => expense.id === id)
  );

  const [title, setTitle] = useState(existingExpense?.title ?? '');
  const [amount, setAmount] = useState(
    existingExpense ? String(existingExpense.amount) : ''
  );
  const [categoryId, setCategoryId] = useState(
    existingExpense?.categoryId ??
      categories.find(
        (item) => item.name === existingExpense?.category
      )?.id ??
      ''
  );
  const [date, setDate] = useState(existingExpense?.date ?? '');
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod | ''>(
      existingExpense?.paymentMethod ?? ''
    );
  const [notes, setNotes] = useState(existingExpense?.notes ?? '');
  const [description, setDescription] = useState(
    existingExpense?.description ?? ''
  );
  const [error, setError] = useState('');

  const isEditing = Boolean(id);
  const loading = useSelector(
    (state: RootState) => state.expenses.status === 'loading'
  );

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError('');

    if (!categoryId || !paymentMethod) {
      setError('Please select a category and payment method.');
      return;
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter an amount greater than zero.');
      return;
    }

    const selectedCategory = categories.find(
      (item) => item.id === categoryId
    );

    if (!selectedCategory) {
      setError('Please select a valid category.');
      return;
    }

    const expenseData: Expense = {
      id: id ?? '',
      title: title.trim(),
      description: description.trim(),
      amount: Number(amount),
      category: selectedCategory.name,
      categoryId,
      date,
      paymentMethod,
      notes: notes.trim(),
    };

    try {
      if (isEditing) {
        await dispatch(updateExpenseThunk(expenseData)).unwrap();
      } else {
        const { id: _unusedId, ...newExpense } = expenseData;
        await dispatch(createExpenseThunk(newExpense)).unwrap();
      }

      navigate('/expenses');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to save the expense. Please try again.'
      );
    }
  };

  const handleCancel = () => {
    navigate('/expenses');
  };

  return (
    <div className="expense-form-container">
      <div className="expense-form-card">
        <div className="form-header">
          <h2>{isEditing ? 'Edit Expense' : 'Add New Expense'}</h2>
          <p>
            {isEditing
              ? 'Update the details of your expense.'
              : 'Enter the details of your expense below.'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="title">Expense Title</label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Groceries"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              placeholder="Describe this expense..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              type="number"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              required
            >
              <option value="">Select a category</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="paymentMethod">Payment Method</label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(event) =>
                setPaymentMethod(event.target.value as PaymentMethod)
              }
              required
            >
              <option value="">Select payment method</option>
              <option value="cash">Cash</option>
              <option value="card">Credit/Debit Card</option>
              <option value="mobile">Mobile Money</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notes">
              Notes <span>(Optional)</span>
            </label>
            <textarea
              id="notes"
              placeholder="Add any additional notes..."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-expense-button"
              disabled={loading}
            >
              {loading
                ? 'Saving...'
                : isEditing
                  ? 'Update Expense'
                  : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExpenseForm;
