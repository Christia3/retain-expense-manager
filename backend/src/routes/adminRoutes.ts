import { Router } from 'express';

import { getAdminInsights } from '../controllers/adminController';

import {
  authenticate,
  requireAdmin,
} from '../middleware/authMiddleware';

const router = Router();

// All admin routes require authentication
router.use(authenticate);

// All routes in this file require ADMIN role
router.use(requireAdmin);

// Admin insights
router.get('/insights', getAdminInsights);

export default router;