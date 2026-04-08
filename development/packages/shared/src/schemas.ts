import { z } from 'zod';
import { HANDLE_RULES, RESERVED_HANDLES } from './constants.js';

// ─── Auth Schemas ────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  role: z.enum(['BUYER', 'SELLER', 'BOTH']).default('BUYER'),
});

// ─── Store Schemas ───────────────────────────────────────────────

export const storeHandleSchema = z
  .string()
  .min(HANDLE_RULES.MIN_LENGTH, `Handle must be at least ${HANDLE_RULES.MIN_LENGTH} characters`)
  .max(HANDLE_RULES.MAX_LENGTH, `Handle must be at most ${HANDLE_RULES.MAX_LENGTH} characters`)
  .regex(
    HANDLE_RULES.PATTERN,
    'Handle can only contain lowercase letters, numbers, and hyphens'
  )
  .refine(
    (val) => !RESERVED_HANDLES.has(val.toLowerCase()),
    'This handle is reserved and cannot be used'
  );

export const createStoreSchema = z.object({
  name: z.string().min(2).max(100),
  handle: storeHandleSchema,
  bio: z.string().max(280).optional(),
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
});

export const updateStoreSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(280).optional(),
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  returnWindow: z.string().optional(),
  returnCondition: z.string().optional(),
  returnShippingCost: z.string().optional(),
  warrantyPeriod: z.string().optional(),
  warrantyCoverage: z.string().optional(),
  refundMethod: z.string().optional(),
  policyNotes: z.string().max(500).optional(),
});

// ─── Listing Schemas ─────────────────────────────────────────────

export const createListingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  price: z.number().positive('Price must be positive').max(99999.99),
  categoryId: z.string().cuid(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'FOR_PARTS']),
  stock: z.number().int().positive().max(999).default(1),
  images: z.array(z.string().url()).min(3, 'At least 3 photos required').max(6),
});

export const updateListingSchema = createListingSchema.partial();

export const searchListingsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'FOR_PARTS']).optional(),
  storeId: z.string().cuid().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sellerType: z.enum(['student', 'reseller']).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'rating']).default('newest'),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// ─── Order Schemas ───────────────────────────────────────────────

export const createOrderSchema = z.object({
  listingId: z.string().cuid(),
  quantity: z.number().int().positive().default(1),
  deliveryMode: z.enum(['CAMPUS_MEETUP', 'SELF_SHIPPING']),
  shippingAddress: z.string().max(500).optional(),
});

// ─── Review Schemas ──────────────────────────────────────────────

export const createReviewSchema = z.object({
  orderId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

// ─── Message Schemas ─────────────────────────────────────────────

export const sendMessageSchema = z.object({
  threadId: z.string().cuid().optional(),
  listingId: z.string().cuid().optional(),
  content: z.string().min(1).max(2000),
});

// ─── Dispute Schemas ─────────────────────────────────────────────

export const createDisputeSchema = z.object({
  orderId: z.string().cuid(),
  reason: z.enum([
    'ITEM_NOT_RECEIVED',
    'NOT_AS_DESCRIBED',
    'COUNTERFEIT',
    'WRONG_ITEM',
    'DAMAGED_IN_TRANSIT',
    'OTHER',
  ]),
  description: z.string().min(20).max(5000),
  evidenceUrls: z.array(z.string().url()).max(10).optional(),
});

// ─── Type Exports ────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type SearchListingsInput = z.infer<typeof searchListingsSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;
