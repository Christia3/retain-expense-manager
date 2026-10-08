import { FormEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import {
  addExpense,
  updateExpense,
} from '../redux/expenseSlice';

import type { RootState, AppDispatch } from '../redux/store';

import type {
  Expense,
  ExpenseCategory,
  PaymentMethod,
} from '../types/expense';

function ExpenseForm() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { id } =
    useParams<{ id: string }>();

  /*
   * Get the categories from Redux.
   *
   * These are the categories created and
   * managed by the admin.
   */
  const categories = useSelector(
    (state: RootState) =>
      state.categories.categories
  );

  /*
   * Find the expense when editing.
   */
  const existingExpense = useSelector(
    (state: RootState) =>
      state.expenses.expenses.find(
        (expense) => expense.id === id
      )
  );

  /*
   * Form state
   */
  const [title, setTitle] = useState(
    existingExpense?.title ?? ''
  );

  const [amount, setAmount] = useState(
    existingExpense
      ? String(existingExpense.amount)
      : ''
  );

  const [category, setCategory] =
    useState<ExpenseCategory | ''>(
      existingExpense?.category ?? ''
    );

  const [date, setDate] = useState(
    existingExpense?.date ?? ''
  );

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod | ''>(
      existingExpense?.paymentMethod ?? ''
    );

  const [notes, setNotes] = useState(
    existingExpense?.notes ?? ''
  );

  const isEditing = Boolean(id);

  /*
   * Submit the form
   */
  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!category || !paymentMethod) {
      return;
    }

    const expenseData: Expense = {
      id: id ?? crypto.randomUUID(),
      title,
      amount: Number(amount),
      category,
      date,
      paymentMethod,
      notes,
    };

    if (isEditing) {
      dispatch(
        updateExpense(expenseData)
      );
    } else {
      dispatch(
        addExpense(expenseData)
      );
    }

    navigate('/expenses');
  };

  /*
   * Cancel
   */
  const handleCancel = () => {
    navigate('/expenses');
  };

  return (
    <div className="expense-form-container">

      <div className="expense-form-card">

        {/* FORM HEADER */}

        <div className="form-header">

          <h2>
            {isEditing
              ? 'Edit Expense'
              : 'Add New Expense'}
          </h2>

          <p>
            {isEditing
              ? 'Update the details of your expense.'
              : 'Enter the details of your expense below.'}
          </p>

        </div>

        <form onSubmit={handleSubmit}>

          {/* TITLE */}

          <div className="form-group">

            <label htmlFor="title">
              Expense Title
            </label>

            <input
              id="title"
              type="text"
              placeholder="e.g. Groceries"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              required
            />

          </div>

          {/* AMOUNT */}

          <div className="form-group">

            <label htmlFor="amount">
              Amount
            </label>

            <input
              id="amount"
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              required
            />

          </div>

          {/* CATEGORY */}

          <div className="form-group">

            <label htmlFor="category">
              Category
            </label>

            <select
              id="category"
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
              required
            >

              <option value="">
                Select a category
              </option>

              {categories.map(
                (categoryItem) => (
                  <option
                    key={categoryItem.id}
                    value={categoryItem.name}
                  >
                    {categoryItem.name}
                  </option>
                )
              )}

            </select>

          </div>

          {/* DATE */}

          <div className="form-group">

            <label htmlFor="date">
              Date
            </label>

            <input
              id="date"
              type="date"
              value={date}
              onChange={(event) =>
                setDate(event.target.value)
              }
              required
            />

          </div>

          {/* PAYMENT METHOD */}

          <div className="form-group">

            <label htmlFor="paymentMethod">
              Payment Method
            </label>

            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(event) =>
                setPaymentMethod(
                  event.target
                    .value as PaymentMethod
                )
              }
              required
            >

              <option value="">
                Select payment method
              </option>

              <option value="cash">
                Cash
              </option>

              <option value="card">
                Credit/Debit Card
              </option>

              <option value="mobile">
                Mobile Money
              </option>

              <option value="bank">
                Bank Transfer
              </option>

            </select>

          </div>

          {/* NOTES */}

          <div className="form-group">

            <label htmlFor="notes">
              Notes <span>(Optional)</span>
            </label>

            <textarea
              id="notes"
              placeholder="Add any additional notes..."
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              rows={4}
            />

          </div>

          {/* BUTTONS */}

          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-expense-button"
            >
              {isEditing
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