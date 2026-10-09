import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

// ===============================
// GET ALL CATEGORIES
// ===============================
export const getCategories = async (
  _req: Request,
  res: Response
) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return res.status(200).json(categories);
  } catch (error) {
    console.error('Get categories error:', error);

    return res.status(500).json({
      message: 'Failed to retrieve categories.',
    });
  }
};

// ===============================
// CREATE CATEGORY - ADMIN ONLY
// ===============================
export const createCategory = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: 'Category name is required.',
      });
    }

    const existingCategory = await prisma.category.findUnique({
      where: {
        name,
      },
    });

    if (existingCategory) {
      return res.status(409).json({
        message: 'A category with this name already exists.',
      });
    }

    const category = await prisma.category.create({
      data: {
        name,
        description: description || null,
      },
    });

    return res.status(201).json({
      message: 'Category created successfully.',
      category,
    });
  } catch (error) {
    console.error('Create category error:', error);

    return res.status(500).json({
      message: 'Failed to create category.',
    });
  }
};

// ===============================
// UPDATE CATEGORY - ADMIN ONLY
// ===============================
export const updateCategory = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const existingCategory = await prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!existingCategory) {
      return res.status(404).json({
        message: 'Category not found.',
      });
    }

    if (name) {
      const duplicateCategory = await prisma.category.findFirst({
        where: {
          name,
          NOT: {
            id,
          },
        },
      });

      if (duplicateCategory) {
        return res.status(409).json({
          message: 'A category with this name already exists.',
        });
      }
    }

    const category = await prisma.category.update({
      where: {
        id,
      },
      data: {
        name,
        description:
          description !== undefined ? description : undefined,
      },
    });

    return res.status(200).json({
      message: 'Category updated successfully.',
      category,
    });
  } catch (error) {
    console.error('Update category error:', error);

    return res.status(500).json({
      message: 'Failed to update category.',
    });
  }
};

// ===============================
// DELETE CATEGORY - ADMIN ONLY
// ===============================
export const deleteCategory = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        expenses: true,
      },
    });

    if (!category) {
      return res.status(404).json({
        message: 'Category not found.',
      });
    }

    // Don't allow deletion if expenses use this category
    if (category.expenses.length > 0) {
      return res.status(400).json({
        message:
          'This category cannot be deleted because expenses are using it.',
      });
    }

    await prisma.category.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      message: 'Category deleted successfully.',
    });
  } catch (error) {
    console.error('Delete category error:', error);

    return res.status(500).json({
      message: 'Failed to delete category.',
    });
  }
};