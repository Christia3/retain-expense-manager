
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

// GET ALL CATEGORIES
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

// CREATE CATEGORY - ADMIN ONLY
export const createCategory = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { name, description } = req.body;

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        message: 'Category name is required.',
      });
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== 'string'
    ) {
      return res.status(400).json({
        message: 'Description must be a string.',
      });
    }

    const normalizedName = name.trim();

    const existingCategory = await prisma.category.findUnique({
      where: {
        name: normalizedName,
      },
    });

    if (existingCategory) {
      return res.status(409).json({
        message: 'A category with this name already exists.',
      });
    }

    const category = await prisma.category.create({
      data: {
        name: normalizedName,
        description:
          typeof description === 'string' && description.trim()
            ? description.trim()
            : null,
      },
    });

    return res.status(201).json({
      message: 'Category created successfully.',
      category,
    });
  } catch (error) {
    // Handle a duplicate name even if concurrent requests race.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return res.status(409).json({
        message: 'A category with this name already exists.',
      });
    }

    console.error('Create category error:', error);

    return res.status(500).json({
      message: 'Failed to create category.',
    });
  }
};

// UPDATE CATEGORY - ADMIN ONLY
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

    if (
      name !== undefined &&
      (typeof name !== 'string' || !name.trim())
    ) {
      return res.status(400).json({
        message: 'Category name cannot be empty.',
      });
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== 'string'
    ) {
      return res.status(400).json({
        message: 'Description must be a string.',
      });
    }

    const normalizedName =
      typeof name === 'string' ? name.trim() : undefined;

    if (normalizedName !== undefined) {
      const duplicateCategory = await prisma.category.findFirst({
        where: {
          name: normalizedName,
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
        name: normalizedName,
        description:
          description === undefined
            ? undefined
            : typeof description === 'string' && description.trim()
              ? description.trim()
              : null,
      },
    });

    return res.status(200).json({
      message: 'Category updated successfully.',
      category,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return res.status(409).json({
        message: 'A category with this name already exists.',
      });
    }

    console.error('Update category error:', error);

    return res.status(500).json({
      message: 'Failed to update category.',
    });
  }
};

// DELETE CATEGORY - ADMIN ONLY
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
        expenses: {
          select: {
            id: true,
          },
          take: 1,
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        message: 'Category not found.',
      });
    }

    // Do not delete categories that are used by expenses.
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
    // The database also prevents deletion if an expense
    // references this category.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return res.status(400).json({
        message:
          'This category cannot be deleted because expenses are using it.',
      });
    }

    console.error('Delete category error:', error);

    return res.status(500).json({
      message: 'Failed to delete category.',
    });
  }
};
