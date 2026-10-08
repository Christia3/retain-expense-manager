import ExpenseForm from '../components/ExpenseForm';

function AddExpensePage() {
  return (
    <div className="expenses-page">

      <header className="page-header">
        <div>
          <h1>Add Expense</h1>
          <p>Record a new personal expense.</p>
        </div>
      </header>

      <ExpenseForm />

    </div>
  );
}

export default AddExpensePage;