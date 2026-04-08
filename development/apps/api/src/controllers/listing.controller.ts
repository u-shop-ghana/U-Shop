import type { Request, Response } from 'express';
import { ListingService } from '../services/listing.service';
import { createListingSchema, updateListingSchema, searchListingsSchema } from '@ushop/shared';

export class ListingController {
  
  static async search(req: Request, res: Response): Promise<void> {
    try {
      // Validate Query constraints using Zod explicitly protecting memory limits
      const queryParams = searchListingsSchema.safeParse(req.query);
      if (!queryParams.success) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid search parameters', details: queryParams.error.flatten() }
        });
        return;
      }

      const listings = await ListingService.searchListings(queryParams.data);
      res.json({ success: true, data: listings });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ success: false, error: { message: msg } });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const listing = await ListingService.getListingById(req.params.id as string);
      if (!listing) {
        res.status(404).json({ success: false, error: { message: 'Listing not found' } });
        return;
      }
      res.json({ success: true, data: listing });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ success: false, error: { message: msg } });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const body = createListingSchema.safeParse(req.body);
      if (!body.success) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid listing input', details: body.error.flatten() }
        });
        return;
      }

      // Execute via Service mapping current user
      const listing = await ListingService.createListing(req.user!.id, body.data);
      res.status(201).json({ success: true, data: listing });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      if (msg.includes('store before publishing')) {
        res.status(403).json({ success: false, error: { message: msg } });
        return;
      }
      res.status(500).json({ success: false, error: { message: msg } });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const body = updateListingSchema.safeParse(req.body);
      if (!body.success) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid update input', details: body.error.flatten() }
        });
        return;
      }

      const updated = await ListingService.updateListing(req.user!.id, req.params.id as string, body.data);
      res.json({ success: true, data: updated });
    } catch (error: unknown) {
       const msg = error instanceof Error ? error.message : "Unknown error";
       if (msg.includes('not found') || msg.includes('permission')) {
         res.status(403).json({ success: false, error: { message: msg } });
         return;
       }
       res.status(500).json({ success: false, error: { message: msg } });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      await ListingService.deleteListing(req.user!.id, req.params.id as string);
      res.json({ success: true, message: "Listing effectively removed." });
    } catch (error: unknown) {
       const msg = error instanceof Error ? error.message : "Unknown error";
       res.status(403).json({ success: false, error: { message: msg } });
    }
  }
}
