import { Router } from 'express';

import {
  getBudget,
  setBudget,
} from '../controllers/budgetController';

import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All budget routes require authentication
router.use(authenticate);

router.get('/', getBudget);
router.put('/', setBudget);

export default router;