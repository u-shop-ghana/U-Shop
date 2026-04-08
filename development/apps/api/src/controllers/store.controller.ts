import type { Request, Response, NextFunction } from 'express';
import { StoreService } from '../services/store.service.js';

export class StoreController {
  /**
   * Initializes a new store.
   * Expects payload mapped to `CreateStoreInput`.
   */
  static async createStore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const store = await StoreService.createStore(req.user.id, req.body);
      
      res.status(201).json({
        success: true,
        data: store,
      });
    } catch (error) {
      // Pass errors correctly to our globally scoped error handler
      next(error);
    }
  }

  /**
   * Patches an existing store layout or configuration.
   * Expects payload mapped to `UpdateStoreInput`.
   */
  static async updateStore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeId = req.params.id as string;
      
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      // We will perform a direct DB lookup to prevent issues.
      const verifiedStore = await StoreService.getStoreById(storeId);

      if (!verifiedStore || verifiedStore.userId !== req.user.id) {
        res.status(403).json({ success: false, error: { message: 'Forbidden: You do not own this store.' } });
        return;
      }

      const activeEdits = await StoreService.updateStore(storeId, req.body);
      res.status(200).json({
        success: true,
        data: activeEdits,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gets a specific store for storefront rendering using Handle.
   */
  static async getStore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const handle = req.params.handle as string;
      const store = await StoreService.getStoreByHandle(handle);

      if (!store) {
        res.status(404).json({ success: false, error: { message: 'Store not found' } });
        return;
      }

      res.status(200).json({
        success: true,
        data: store,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Boolean return ensuring Handles are safely usable.
   */
  static async checkHandle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const handle = req.params.handle as string;
      
      // Extremely quick bounce checking
      const available = await StoreService.isHandleAvailable(handle);
      
      res.status(200).json({
        success: true,
        data: { available },
      });
    } catch (error) {
      next(error);
    }
  }
}
