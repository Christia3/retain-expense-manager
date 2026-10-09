import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { prisma } from './lib/prisma';

import authRoutes from './routes/authRoutes';
import expenseRoutes from './routes/expenseRoutes';
import categoryRoutes from './routes/categoryRoutes';
import budgetRoutes from './routes/budgetRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();
const PORT = 5000;

// ===============================
// MIDDLEWARE
// ===============================

app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);

app.use(express.json());

// ===============================
// API ROUTES
// ===============================

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/admin', adminRoutes);

// ===============================
// BASIC ROUTES
// ===============================

app.get('/', (_req, res) => {
  res.json({
    message: 'Retain API is running!',
  });
});

// ===============================
// DATABASE TEST
// ===============================

app.get('/api/test-db', async (_req, res) => {
  try {
    const userCount = await prisma.user.count();

    res.json({
      message: 'Database connection is working!',
      userCount,
    });
  } catch (error) {
    console.error('Database error:', error);

    res.status(500).json({
      message: 'Database connection failed.',
    });
  }
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
  console.log(
    `Retain API running on http://localhost:${PORT}`
  );
});