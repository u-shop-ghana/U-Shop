import { Router } from 'express';
import { StoreController } from '../controllers/store.controller';
import { authenticate } from '../middleware/authenticate';
import { validateBody } from '../middleware/validate-body';
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
