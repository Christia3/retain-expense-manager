
import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

// Validate the exact YYYY-MM format and calendar month.
function parseMonth(value: unknown): Date | null {
  if (typeof value !== 'string') {
    return null;
  }

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
    return null;
  }

  const month = new Date(`${value}-01T00:00:00.000Z`);

  return Number.isNaN(month.getTime()) ? null : month;
}

// Accept finite, non-negative budget amounts.
// Zero is allowed so users can reset their budget.
function isValidBudgetAmount(value: unknown): boolean {
  if (
    value === '' ||
    value === null ||
    value === undefined
  ) {
    return false;
  }

  const amount = Number(value);

  return Number.isFinite(amount) && amount >= 0;
}

// GET MONTHLY BUDGET
export const getBudget = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const monthParam = req.query.month;
    const month = parseMonth(monthParam);

    if (!month) {
      return res.status(400).json({
        message: 'Invalid month format. Use YYYY-MM.',
      });
    }

    const userId = req.user!.userId;

    const budget = await prisma.budget.findUnique({
      where: {
        userId_month: {
          userId,
          month,
        },
      },
    });

    // Calculate the selected month's date range in UTC.
    const startDate = month;
    const endDate = new Date(month);
    endDate.setUTCMonth(endDate.getUTCMonth() + 1);

    // Only count expenses belonging to the authenticated user.
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        amount: true,
      },
    });

    const totalSpent = expenses.reduce(
      (total, expense) => total + Number(expense.amount),
      0
    );

    const budgetAmount = budget
      ? Number(budget.amount)
      : 0;

    const remaining = budgetAmount - totalSpent;

    let status: 'WITHIN' | 'APPROACHING' | 'OVER';

    if (totalSpent > budgetAmount) {
      status = 'OVER';
    } else if (
      budgetAmount > 0 &&
      totalSpent >= budgetAmount * 0.8
    ) {
      status = 'APPROACHING';
    } else {
      status = 'WITHIN';
    }

    return res.status(200).json({
      month: monthParam,
      budget: budgetAmount,
      totalSpent,
      remaining,
      status,
    });
  } catch (error) {
    console.error('Get budget error:', error);

    return res.status(500).json({
      message: 'Failed to retrieve budget.',
    });
  }
};

// CREATE OR UPDATE MONTHLY BUDGET
export const setBudget = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { month: monthParam, amount } = req.body;

    const month = parseMonth(monthParam);

    if (!month) {
      return res.status(400).json({
        message: 'Invalid month format. Use YYYY-MM.',
      });
    }

    if (!isValidBudgetAmount(amount)) {
      return res.status(400).json({
        message:
          'Budget amount must be a valid non-negative number.',
      });
    }

    const budgetAmount = Number(amount);
    const userId = req.user!.userId;

    const budget = await prisma.budget.upsert({
      where: {
        userId_month: {
          userId,
          month,
        },
      },
      update: {
        amount: budgetAmount,
      },
      create: {
        userId,
        month,
        amount: budgetAmount,
      },
    });

    return res.status(200).json({
      message: 'Budget saved successfully.',
      budget,
    });
  } catch (error) {
    console.error('Set budget error:', error);

    return res.status(500).json({
      message: 'Failed to save budget.',
    });
  }
};
