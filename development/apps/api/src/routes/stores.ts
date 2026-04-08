import { Router } from 'express';
import { StoreController } from '../controllers/store.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateBody } from '../middleware/validate-body.js';
import { createStoreSchema, updateStoreSchema } from '@ushop/shared';

const router: Router = Router();

// Public Routes
router.get('/check-handle/:handle', StoreController.checkHandle);
router.get('/:handle', StoreController.getStore);

// Protected Routes
router.use(authenticate);

router.post(
  '/',
  validateBody(createStoreSchema),
  StoreController.createStore
);

router.patch(
  '/:id',
  validateBody(updateStoreSchema),
  StoreController.updateStore
);

export default router;
