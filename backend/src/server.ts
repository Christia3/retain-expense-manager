
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes';
import expenseRoutes from './routes/expenseRoutes';
import categoryRoutes from './routes/categoryRoutes';
import budgetRoutes from './routes/budgetRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_URL =
  process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: FRONTEND_URL,
  })
);

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (_req, res) => {
  res.json({
    message: 'Retain API is running!',
  });
});

app.listen(PORT, () => {
  console.log(`Retain API running on port ${PORT}`);
});
