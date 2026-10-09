import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

// ===============================
// GET ALL EXPENSES
// ===============================
export const getExpenses = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.user!.userId,
      },
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return res.status(200).json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);

    return res.status(500).json({
      message: 'Failed to retrieve expenses.',
    });
  }
};

// ===============================
// GET ONE EXPENSE
// ===============================
export const getExpenseById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const expense = await prisma.expense.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
      include: {
        category: true,
      },
    });

    if (!expense) {
      return res.status(404).json({
        message: 'Expense not found.',
      });
    }

    return res.status(200).json(expense);
  } catch (error) {
    console.error('Get expense error:', error);

    return res.status(500).json({
      message: 'Failed to retrieve expense.',
    });
  }
};

// ===============================
// CREATE EXPENSE
// ===============================
export const createExpense = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      title,
      description,
      amount,
      categoryId,
      date,
      paymentMethod,
      notes,
    } = req.body;

    if (
      !title ||
      amount === undefined ||
      !categoryId ||
      !date ||
      !paymentMethod
    ) {
      return res.status(400).json({
        message:
          'Title, amount, category, date, and payment method are required.',
      });
    }

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return res.status(400).json({
        message: 'Selected category does not exist.',
      });
    }

    const expense = await prisma.expense.create({
      data: {
        title,
        description: description || null,
        amount: Number(amount),
        categoryId,
        date: new Date(date),
        paymentMethod,
        notes: notes || null,
        userId: req.user!.userId,
      },
      include: {
        category: true,
      },
    });

    return res.status(201).json({
      message: 'Expense created successfully.',
      expense,
    });
  } catch (error) {
    console.error('Create expense error:', error);

    return res.status(500).json({
      message: 'Failed to create expense.',
    });
  }
};

// ===============================
// UPDATE EXPENSE
// ===============================
export const updateExpense = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      amount,
      categoryId,
      date,
      paymentMethod,
      notes,
    } = req.body;

    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
    });

    if (!existingExpense) {
      return res.status(404).json({
        message: 'Expense not found.',
      });
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });

      if (!category) {
        return res.status(400).json({
          message: 'Selected category does not exist.',
        });
      }
    }

    const expense = await prisma.expense.update({
      where: {
        id,
      },
      data: {
        title,
        description: description || null,
        amount: amount !== undefined ? Number(amount) : undefined,
        categoryId,
        date: date ? new Date(date) : undefined,
        paymentMethod,
        notes: notes || null,
      },
      include: {
        category: true,
      },
    });

    return res.status(200).json({
      message: 'Expense updated successfully.',
      expense,
    });
  } catch (error) {
    console.error('Update expense error:', error);

    return res.status(500).json({
      message: 'Failed to update expense.',
    });
  }
};

// ===============================
// DELETE EXPENSE
// ===============================
export const deleteExpense = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
    });

    if (!existingExpense) {
      return res.status(404).json({
        message: 'Expense not found.',
      });
    }

    await prisma.expense.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      message: 'Expense deleted successfully.',
    });
  } catch (error) {
    console.error('Delete expense error:', error);

    return res.status(500).json({
      message: 'Failed to delete expense.',
    });
  }
};