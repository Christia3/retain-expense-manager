import { FormEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState, AppDispatch } from '../redux/store';

import {
  addCategory,
  updateCategory,
  deleteCategory,
} from '../redux/categorySlice';

function AdminCategoriesPage() {
  const dispatch = useDispatch<AppDispatch>();

  const categories = useSelector(
    (state: RootState) =>
      state.categories.categories
  );

  const [name, setName] = useState('');
  const [description, setDescription] =
    useState('');

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    if (editingId) {
      dispatch(
        updateCategory({
          id: editingId,
          name: name.trim(),
          description: description.trim(),
        })
      );
    } else {
      dispatch(
        addCategory({
          id: crypto.randomUUID(),
          name: name.trim(),
          description: description.trim(),
        })
      );
    }

    setName('');
    setDescription('');
    setEditingId(null);
  };

  const handleEdit = (
    id: string,
    categoryName: string,
    categoryDescription?: string
  ) => {
    setEditingId(id);
    setName(categoryName);
    setDescription(
      categoryDescription || ''
    );
  };

  const handleDelete = (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this category?'
    );

    if (!confirmed) {
      return;
    }

    dispatch(deleteCategory(id));

    if (editingId === id) {
      setEditingId(null);
      setName('');
      setDescription('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setDescription('');
  };

  return (
    <div className="admin-page">

      <header className="page-header">
        <div>
          <h1>Manage Categories</h1>

          <p>
            Create, update, and manage expense
            categories.
          </p>
        </div>
      </header>

      <div className="admin-category-layout">

        {/* CATEGORY FORM */}

        <section className="dashboard-card">

          <div className="card-header">
            <div>
              <h2>
                {editingId
                  ? 'Edit Category'
                  : 'Add Category'}
              </h2>

              <p>
                {editingId
                  ? 'Update the category information.'
                  : 'Create a new expense category.'}
              </p>
            </div>
          </div>

          <form
            className="expense-form"
            onSubmit={handleSubmit}
          >

            <div className="form-group">
              <label htmlFor="category-name">
                Category Name
              </label>

              <input
                id="category-name"
                type="text"
                placeholder="e.g. Education"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
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
                  setDescription(
                    event.target.value
                  )
                }
                rows={4}
              />
            </div>

            <div className="form-actions">

              <button
                type="submit"
                className="primary-button"
              >
                {editingId
                  ? 'Update Category'
                  : 'Add Category'}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleCancelEdit}
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

              <p>
                {categories.length}{' '}
                categories available
              </p>
            </div>
          </div>

          {categories.length === 0 ? (
            <p>
              No categories available.
            </p>
          ) : (
            <div className="category-list">

              {categories.map((category) => (
                <div
                  className="category-item"
                  key={category.id}
                >

                  <div className="category-info">

                    <strong>
                      {category.name}
                    </strong>

                    <span>
                      {category.description ||
                        'No description'}
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
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="danger-button"
                      onClick={() =>
                        handleDelete(
                          category.id
                        )
                      }
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