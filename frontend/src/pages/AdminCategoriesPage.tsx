
import { FormEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState, AppDispatch } from '../redux/store';

import {
  fetchCategories,
  createCategoryThunk,
  updateCategoryThunk,
  deleteCategoryThunk,
  clearCategoryError,
} from '../redux/categorySlice';

function AdminCategoriesPage() {
  const dispatch = useDispatch<AppDispatch>();

  const categories = useSelector(
    (state: RootState) => state.categories.categories
  );

  const status = useSelector(
    (state: RootState) => state.categories.status
  );

  const categoryError = useSelector(
    (state: RootState) => state.categories.error
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCategories());
    }
  }, [dispatch, status]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setEditingId(null);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    setFormError('');
    setSuccessMessage('');
    dispatch(clearCategoryError());

    if (!trimmedName) {
      setFormError('Please enter a category name.');
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await dispatch(
          updateCategoryThunk({
            id: editingId,
            name: trimmedName,
            description: trimmedDescription,
          })
        ).unwrap();

        setSuccessMessage('Category updated successfully.');
      } else {
        await dispatch(
          createCategoryThunk({
            name: trimmedName,
            description: trimmedDescription,
          })
        ).unwrap();

        setSuccessMessage('Category created successfully.');
      }

      resetForm();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'The category could not be saved.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (
    id: string,
    categoryName: string,
    categoryDescription?: string
  ) => {
    setEditingId(id);
    setName(categoryName);
    setDescription(categoryDescription || '');
    setFormError('');
    setSuccessMessage('');
    dispatch(clearCategoryError());
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this category?'
    );

    if (!confirmed) {
      return;
    }

    setFormError('');
    setSuccessMessage('');
    dispatch(clearCategoryError());

    try {
      await dispatch(deleteCategoryThunk(id)).unwrap();

      setSuccessMessage('Category deleted successfully.');

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'The category could not be deleted.'
      );
    }
  };

  const handleCancelEdit = () => {
    resetForm();
    setFormError('');
    setSuccessMessage('');
    dispatch(clearCategoryError());
  };

  return (
    <div className="admin-page">
      <header className="page-header">
        <div>
          <h1>Manage Categories</h1>
          <p>Create, update, and manage expense categories.</p>
        </div>
      </header>

      {(formError || categoryError) && (
        <p role="alert">
          {formError || categoryError}
        </p>
      )}

      {successMessage && (
        <p role="status">{successMessage}</p>
      )}

      <div className="admin-category-layout">
        {/* CATEGORY FORM */}
        <section className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>
                {editingId ? 'Edit Category' : 'Add Category'}
              </h2>
              <p>
                {editingId
                  ? 'Update the category information.'
                  : 'Create a new expense category.'}
              </p>
            </div>
          </div>

          <form className="expense-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="category-name">
                Category Name
              </label>
              <input
                id="category-name"
                type="text"
                placeholder="e.g. Education"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category-description">
                Description
              </label>
              <textarea
                id="category-description"
                placeholder="Describe this category..."
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                rows={4}
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Update Category'
                    : 'Add Category'}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* CATEGORY LIST */}
        <section className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Categories</h2>
              <p>{categories.length} categories available</p>
            </div>
          </div>

          {status === 'loading' && categories.length === 0 ? (
            <p>Loading categories...</p>
          ) : categories.length === 0 ? (
            <p>No categories available.</p>
          ) : (
            <div className="category-list">
              {categories.map((category) => (
                <div
                  className="category-item"
                  key={category.id}
                >
                  <div className="category-info">
                    <strong>{category.name}</strong>
                    <span>
                      {category.description || 'No description'}
                    </span>
                  </div>

                  <div className="category-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() =>
                        handleEdit(
                          category.id,
                          category.name,
                          category.description
                        )
                      }
                      disabled={saving}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => handleDelete(category.id)}
                      disabled={saving}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminCategoriesPage;
