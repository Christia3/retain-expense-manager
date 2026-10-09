import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

// ===============================
// GET MONTHLY BUDGET
// ===============================
export const getBudget = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const monthParam = req.query.month as string;

    if (!monthParam) {
      return res.status(400).json({
        message: 'Month is required. Use YYYY-MM format.',
      });
    }

    const month = new Date(`${monthParam}-01T00:00:00.000Z`);

    if (isNaN(month.getTime())) {
      return res.status(400).json({
        message: 'Invalid month format. Use YYYY-MM.',
      });
    }

    const budget = await prisma.budget.findUnique({
      where: {
        userId_month: {
          userId: req.user!.userId,
          month,
        },
      },
    });

    // Calculate the month's date range
    const startDate = new Date(month);
    const endDate = new Date(month);

    endDate.setUTCMonth(endDate.getUTCMonth() + 1);

    // Calculate total spending for the month
    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.user!.userId,
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

    const budgetAmount = budget ? Number(budget.amount) : 0;
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

// ===============================
// CREATE OR UPDATE MONTHLY BUDGET
// ===============================
export const setBudget = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { month, amount } = req.body;

    if (!month || amount === undefined) {
      return res.status(400).json({
        message: 'Month and amount are required.',
      });
    }

    const budgetAmount = Number(amount);

    if (isNaN(budgetAmount) || budgetAmount < 0) {
      return res.status(400).json({
        message: 'Budget amount must be a valid positive number.',
      });
    }

    const budgetMonth = new Date(
      `${month}-01T00:00:00.000Z`
    );

    if (isNaN(budgetMonth.getTime())) {
      return res.status(400).json({
        message: 'Invalid month format. Use YYYY-MM.',
      });
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_month: {
          userId: req.user!.userId,
          month: budgetMonth,
        },
      },
      update: {
        amount: budgetAmount,
      },
      create: {
        userId: req.user!.userId,
        month: budgetMonth,
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