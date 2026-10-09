import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

// ===============================
// GET ADMIN INSIGHTS
// ===============================
export const getAdminInsights = async (
  _req: AuthRequest,
  res: Response
) => {
  try {
    // BASIC COUNTS
    const totalUsers = await prisma.user.count();
    const totalExpenses = await prisma.expense.count();

    const allExpenses = await prisma.expense.findMany({
      select: {
        amount: true,
      },
    });

    const totalExpenseValue = allExpenses.reduce(
      (total, expense) => total + Number(expense.amount),
      0
    );

    // CURRENT MONTH
    const now = new Date();

    const startOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    );

    const startOfNextMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
    );

    const currentMonthExpenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
      select: {
        amount: true,
      },
    });

    const currentMonthExpenseValue = currentMonthExpenses.reduce(
      (total, expense) => total + Number(expense.amount),
      0
    );

    // SPENDING BY CATEGORY
    const categories = await prisma.category.findMany({
      include: {
        expenses: {
          select: {
            amount: true,
          },
        },
      },
    });

    const spendingByCategory = categories
      .map((category) => {
        const total = category.expenses.reduce(
          (sum, expense) => sum + Number(expense.amount),
          0
        );

        return {
          id: category.id,
          name: category.name,
          description: category.description,
          total,
          expenseCount: category.expenses.length,
        };
      })
      .sort((a, b) => b.total - a.total);

    // TOP 5 CATEGORIES WITH SPENDING
    const top5Categories = spendingByCategory
      .filter((category) => category.expenseCount > 0)
      .slice(0, 5);

    // BOTTOM 5 CATEGORIES WITH SPENDING
    const bottom5Categories = [...spendingByCategory]
      .filter((category) => category.total > 0)
      .sort((a, b) => a.total - b.total)
      .slice(0, 5);

    // RECENT EXPENSES
    const recentExpenses = await prisma.expense.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // RECENT USERS
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // RETURN INSIGHTS
    return res.status(200).json({
      totalUsers,
      totalExpenses,
      totalExpenseValue,
      currentMonthExpenses: currentMonthExpenses.length,
      currentMonthExpenseValue,
      spendingByCategory,
      top5Categories,
      bottom5Categories,
      recentExpenses,
      recentUsers,
    });
  } catch (error) {
    console.error('Admin insights error:', error);

    return res.status(500).json({
      message: 'Failed to retrieve admin insights.',
    });
  }
};

// ===============================
// GET ALL USERS - ADMIN ONLY
// ===============================
export const getAdminUsers = async (
  _req: AuthRequest,
  res: Response
) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error('Get admin users error:', error);

    return res.status(500).json({
      message: 'Failed to retrieve users.',
    });
  }
};

// ===============================
// GET ALL EXPENSES - ADMIN ONLY
// ===============================
export const getAdminExpenses = async (
  _req: AuthRequest,
  res: Response
) => {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return res.status(200).json(expenses);
  } catch (error) {
    console.error('Get admin expenses error:', error);

    return res.status(500).json({
      message: 'Failed to retrieve all expenses.',
    });
  }
};
