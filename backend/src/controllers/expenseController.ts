
import { Response } from 'express';
import { PaymentMethod } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

const validPaymentMethods = Object.values(PaymentMethod);

function isValidDate(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim() !== '' &&
    !Number.isNaN(new Date(value).getTime())
  );
}

function isValidAmount(value: unknown): boolean {
  const amount = Number(value);
  return (
    value !== '' &&
    value !== null &&
    value !== undefined &&
    Number.isFinite(amount) &&
    amount > 0
  );
}

// GET ALL EXPENSES
export const getExpenses = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: req.user!.userId },
      include: { category: true },
      orderBy: { date: 'desc' },
    });

    return res.status(200).json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve expenses.',
    });
  }
};

// GET ONE EXPENSE
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
      include: { category: true },
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

// CREATE EXPENSE
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
      typeof title !== 'string' ||
      !title.trim() ||
      !categoryId ||
      !isValidAmount(amount) ||
      !isValidDate(date) ||
      !validPaymentMethods.includes(paymentMethod)
    ) {
      return res.status(400).json({
        message:
          'Provide a title, positive amount, valid category, valid date, and valid payment method.',
      });
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(400).json({
        message: 'Selected category does not exist.',
      });
    }

    const expense = await prisma.expense.create({
      data: {
        title: title.trim(),
        description:
          typeof description === 'string' && description.trim()
            ? description.trim()
            : null,
        amount: Number(amount),
        categoryId,
        date: new Date(date),
        paymentMethod,
        notes:
          typeof notes === 'string' && notes.trim()
            ? notes.trim()
            : null,
        userId: req.user!.userId,
      },
      include: { category: true },
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

// UPDATE EXPENSE
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

    const data: {
      title?: string;
      description?: string | null;
      amount?: number;
      categoryId?: string;
      date?: Date;
      paymentMethod?: PaymentMethod;
      notes?: string | null;
    } = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({
          message: 'Title must be a non-empty string.',
        });
      }
      data.title = title.trim();
    }

    if (amount !== undefined) {
      if (!isValidAmount(amount)) {
        return res.status(400).json({
          message: 'Amount must be a positive number.',
        });
      }
      data.amount = Number(amount);
    }

    if (date !== undefined) {
      if (!isValidDate(date)) {
        return res.status(400).json({
          message: 'Please provide a valid date.',
        });
      }
      data.date = new Date(date);
    }

    if (paymentMethod !== undefined) {
      if (!validPaymentMethods.includes(paymentMethod)) {
        return res.status(400).json({
          message: 'Invalid payment method.',
        });
      }
      data.paymentMethod = paymentMethod;
    }

    if (categoryId !== undefined) {
      if (typeof categoryId !== 'string' || !categoryId) {
        return res.status(400).json({
          message: 'Please select a valid category.',
        });
      }

      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return res.status(400).json({
          message: 'Selected category does not exist.',
        });
      }

      data.categoryId = categoryId;
    }

    if (description !== undefined) {
      data.description =
        typeof description === 'string' && description.trim()
          ? description.trim()
          : null;
    }

    if (notes !== undefined) {
      data.notes =
        typeof notes === 'string' && notes.trim()
          ? notes.trim()
          : null;
    }

    const result = await prisma.expense.updateMany({
      where: {
        id,
        userId: req.user!.userId,
      },
      data,
    });

    if (result.count === 0) {
      return res.status(404).json({
        message: 'Expense not found.',
      });
    }

    const expense = await prisma.expense.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
      include: { category: true },
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

// DELETE EXPENSE
export const deleteExpense = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await prisma.expense.deleteMany({
      where: {
        id,
        userId: req.user!.userId,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({
        message: 'Expense not found.',
      });
    }

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
