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
    // --------------------------------
    // BASIC COUNTS
    // --------------------------------

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

    // --------------------------------
    // CURRENT MONTH
    // --------------------------------

    const now = new Date();

    const startOfMonth = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        1
      )
    );

    const startOfNextMonth = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth() + 1,
        1
      )
    );

    const currentMonthExpenses =
      await prisma.expense.findMany({
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

    const currentMonthExpenseValue =
      currentMonthExpenses.reduce(
        (total, expense) => total + Number(expense.amount),
        0
      );

    // --------------------------------
    // SPENDING BY CATEGORY
    // --------------------------------

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

    // --------------------------------
    // TOP 5 CATEGORIES
    // --------------------------------

    const top5Categories = spendingByCategory.slice(0, 5);

    // --------------------------------
    // BOTTOM 5 CATEGORIES
    // --------------------------------

    const bottom5Categories = [
      ...spendingByCategory,
    ]
      .filter((category) => category.total > 0)
      .sort((a, b) => a.total - b.total)
      .slice(0, 5);

    // --------------------------------
    // RECENT EXPENSES
    // --------------------------------

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

    // --------------------------------
    // RECENT USERS
    // --------------------------------

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

    // --------------------------------
    // RETURN INSIGHTS
    // --------------------------------

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