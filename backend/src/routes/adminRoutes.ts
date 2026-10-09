import { Router } from 'express';
import {
  getAdminInsights,
  getAdminUsers,
  getAdminExpenses,
} from '../controllers/adminController';
import {
  authenticate,
  requireAdmin,
} from '../middleware/authMiddleware';

const router = Router();

// All routes below require an authenticated administrator.
router.use(authenticate);
router.use(requireAdmin);

router.get('/insights', getAdminInsights);
router.get('/users', getAdminUsers);
router.get('/expenses', getAdminExpenses);

export default router;