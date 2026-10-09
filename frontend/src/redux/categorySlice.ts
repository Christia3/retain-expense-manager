
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Category } from '../types/category';
import { apiRequest } from '../services/api';

type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface CategoryState {
  categories: Category[];
  status: RequestStatus;
  error: string | null;
}

interface CategoryInput {
  name: string;
  description?: string;
}

interface CategoryUpdate extends CategoryInput {
  id: string;
}

interface CategoryResponse {
  message?: string;
  category?: Category;
}

const initialState: CategoryState = {
  categories: [],
  status: 'idle',
  error: null,
};

function getToken(): string {
  const token = localStorage.getItem('retain_token');

  if (!token) {
    throw new Error('Please sign in to manage categories.');
  }

  return token;
}

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async () => {
    return apiRequest<Category[]>('/categories', {
      token: getToken(),
    });
  }
);

export const createCategoryThunk = createAsyncThunk(
  'categories/createCategory',
  async (category: CategoryInput) => {
    const response = await apiRequest<CategoryResponse>(
      '/categories',
      {
        method: 'POST',
        token: getToken(),
        body: JSON.stringify({
          name: category.name,
          description: category.description,
        }),
      }
    );

    if (!response.category) {
      throw new Error('The server did not return the created category.');
    }

    return response.category;
  }
);

export const updateCategoryThunk = createAsyncThunk(
  'categories/updateCategory',
  async (category: CategoryUpdate) => {
    const response = await apiRequest<CategoryResponse>(
      `/categories/${category.id}`,
      {
        method: 'PUT',
        token: getToken(),
        body: JSON.stringify({
          name: category.name,
          description: category.description,
        }),
      }
    );

    if (!response.category) {
      throw new Error('The server did not return the updated category.');
    }

    return response.category;
  }
);

export const deleteCategoryThunk = createAsyncThunk(
  'categories/deleteCategory',
  async (id: string) => {
    await apiRequest<unknown>(`/categories/${id}`, {
      method: 'DELETE',
      token: getToken(),
    });

    return id;
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    addCategory: (state, action: PayloadAction<Category>) => {
      state.categories.push(action.payload);
    },
    updateCategory: (state, action: PayloadAction<Category>) => {
      const index = state.categories.findIndex(
        (category) => category.id === action.payload.id
      );

      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(
        (category) => category.id !== action.payload
      );
    },
    clearCategoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.error.message ?? 'Failed to load categories.';
      })
      .addCase(createCategoryThunk.fulfilled, (state, action) => {
        const exists = state.categories.some(
          (category) => category.id === action.payload.id
        );

        if (!exists) {
          state.categories.push(action.payload);
          state.categories.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
        }

        state.error = null;
      })
      .addCase(createCategoryThunk.rejected, (state, action) => {
        state.error =
          action.error.message ?? 'Failed to create category.';
      })
      .addCase(updateCategoryThunk.fulfilled, (state, action) => {
        const index = state.categories.findIndex(
          (category) => category.id === action.payload.id
        );

        if (index !== -1) {
          state.categories[index] = action.payload;
          state.categories.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
        }

        state.error = null;
      })
      .addCase(updateCategoryThunk.rejected, (state, action) => {
        state.error =
          action.error.message ?? 'Failed to update category.';
      })
      .addCase(deleteCategoryThunk.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (category) => category.id !== action.payload
        );

        state.error = null;
      })
      .addCase(deleteCategoryThunk.rejected, (state, action) => {
        state.error =
          action.error.message ?? 'Failed to delete category.';
      });
  },
});

export const {
  addCategory,
  updateCategory,
  deleteCategory,
  clearCategoryError,
} = categorySlice.actions;

export default categorySlice.reducer;
