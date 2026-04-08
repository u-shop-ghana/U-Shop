import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { ListingController } from '../controllers/listing.controller.js';

const router: Router = Router();

// Publicly readable endpoints bypassing active authorizations
router.get('/', ListingController.search);
router.get('/:id', ListingController.getById);

// Protected mutated endpoints (Requires logged in User context hooked inside)
router.post('/', authenticate, ListingController.create);
router.patch('/:id', authenticate, ListingController.update);
router.delete('/:id', authenticate, ListingController.delete);

export default router;
