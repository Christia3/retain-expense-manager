import { Router } from 'express';

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';

import {
  authenticate,
  requireAdmin,
} from '../middleware/authMiddleware';

const router = Router();

// Anyone logged in can view categories
router.get('/', authenticate, getCategories);

// Only admins can manage categories
router.post(
  '/',
  authenticate,
  requireAdmin,
  createCategory
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  updateCategory
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  deleteCategory
);

export default router;