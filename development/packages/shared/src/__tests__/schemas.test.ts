import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  storeHandleSchema,
  createStoreSchema,
  updateStoreSchema,
  createListingSchema,
  searchListingsSchema,
  createOrderSchema,
  createReviewSchema,
  sendMessageSchema,
  createDisputeSchema,
} from '../schemas';

// ─── Register Schema ────────────────────────────────────────────
describe('registerSchema', () => {
  it('accepts a valid registration payload', () => {
    const result = registerSchema.safeParse({
      email: 'kwame@ug.edu.gh',
      fullName: 'Kwame Mensah',
      role: 'BUYER',
    });
    expect(result.success).toBe(true);
  });

  it('defaults role to BUYER when omitted', () => {
    const result = registerSchema.safeParse({
      email: 'ama@ashesi.edu.gh',
      fullName: 'Ama Owusu',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe('BUYER');
    }
  });

  it('rejects an invalid email', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      fullName: 'Test User',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a name shorter than 2 characters', () => {
    const result = registerSchema.safeParse({
      email: 'test@ug.edu.gh',
      fullName: 'A',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a name longer than 100 characters', () => {
    const result = registerSchema.safeParse({
      email: 'test@ug.edu.gh',
      fullName: 'A'.repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid role', () => {
    const result = registerSchema.safeParse({
      email: 'test@ug.edu.gh',
      fullName: 'Test User',
      role: 'SUPERADMIN',
    });
    expect(result.success).toBe(false);
  });
});

// ─── Store Handle Schema ────────────────────────────────────────
describe('storeHandleSchema', () => {
  it('accepts a valid handle', () => {
    const result = storeHandleSchema.safeParse('kwame-tech');
    expect(result.success).toBe(true);
  });

  it('rejects handles shorter than 3 characters', () => {
    const result = storeHandleSchema.safeParse('ab');
    expect(result.success).toBe(false);
  });

  it('rejects handles longer than 24 characters', () => {
    const result = storeHandleSchema.safeParse('a'.repeat(25));
    expect(result.success).toBe(false);
  });

  it('rejects handles with uppercase letters', () => {
    const result = storeHandleSchema.safeParse('MyStore');
    expect(result.success).toBe(false);
  });

  it('rejects handles starting with a hyphen', () => {
    const result = storeHandleSchema.safeParse('-bad-handle');
    expect(result.success).toBe(false);
  });

  it('rejects handles ending with a hyphen', () => {
    const result = storeHandleSchema.safeParse('bad-handle-');
    expect(result.success).toBe(false);
  });

  it('rejects reserved handles like "admin"', () => {
    const result = storeHandleSchema.safeParse('admin');
    expect(result.success).toBe(false);
  });

  it('rejects reserved handles like "dashboard"', () => {
    const result = storeHandleSchema.safeParse('dashboard');
    expect(result.success).toBe(false);
  });

  it('rejects reserved handles like "api"', () => {
    const result = storeHandleSchema.safeParse('api');
    expect(result.success).toBe(false);
  });
});

// ─── Create Store Schema ────────────────────────────────────────
describe('createStoreSchema', () => {
  const validStore = {
    name: 'Kwame Tech Hub',
    handle: 'kwame-tech',
    bio: 'Best tech deals on campus',
    sellerType: 'STUDENT' as const,
  };

  it('accepts a valid store creation payload', () => {
    const result = createStoreSchema.safeParse(validStore);
    expect(result.success).toBe(true);
  });

  it('rejects a store name shorter than 2 characters', () => {
    const result = createStoreSchema.safeParse({ ...validStore, name: 'K' });
    expect(result.success).toBe(false);
  });

  it('allows empty string for contactEmail', () => {
    const result = createStoreSchema.safeParse({ ...validStore, contactEmail: '' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid contactEmail', () => {
    const result = createStoreSchema.safeParse({ ...validStore, contactEmail: 'not-email' });
    expect(result.success).toBe(false);
  });

  it('accepts a valid contactEmail', () => {
    const result = createStoreSchema.safeParse({ ...validStore, contactEmail: 'test@gmail.com' });
    expect(result.success).toBe(true);
  });

  it('rejects bio longer than 280 characters', () => {
    const result = createStoreSchema.safeParse({ ...validStore, bio: 'x'.repeat(281) });
    expect(result.success).toBe(false);
  });
});

// ─── Update Store Schema ────────────────────────────────────────
describe('updateStoreSchema', () => {
  it('accepts a partial update with just a name', () => {
    const result = updateStoreSchema.safeParse({ name: 'New Name' });
    expect(result.success).toBe(true);
  });

  it('accepts an empty object (no fields to update)', () => {
    const result = updateStoreSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects policyNotes longer than 500 characters', () => {
    const result = updateStoreSchema.safeParse({ policyNotes: 'x'.repeat(501) });
    expect(result.success).toBe(false);
  });
});

// ─── Create Listing Schema ──────────────────────────────────────
describe('createListingSchema', () => {
  const validListing = {
    title: 'MacBook Pro M3 2024',
    description: 'Brand new MacBook Pro with M3 chip, still in original packaging.',
    price: 12500.00,
    categoryId: 'laptops',
    condition: 'NEW' as const,
    stock: 1,
    images: ['https://example.com/img1.jpg'],
  };

  it('accepts a valid listing payload', () => {
    const result = createListingSchema.safeParse(validListing);
    expect(result.success).toBe(true);
  });

  it('rejects title shorter than 5 characters', () => {
    const result = createListingSchema.safeParse({ ...validListing, title: 'Mac' });
    expect(result.success).toBe(false);
  });

  it('rejects description shorter than 20 characters', () => {
    const result = createListingSchema.safeParse({ ...validListing, description: 'Too short' });
    expect(result.success).toBe(false);
  });

  it('rejects a price of 0', () => {
    const result = createListingSchema.safeParse({ ...validListing, price: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative price', () => {
    const result = createListingSchema.safeParse({ ...validListing, price: -50 });
    expect(result.success).toBe(false);
  });

  it('rejects price exceeding max (99999.99)', () => {
    const result = createListingSchema.safeParse({ ...validListing, price: 100000 });
    expect(result.success).toBe(false);
  });

  it('rejects an empty images array', () => {
    const result = createListingSchema.safeParse({ ...validListing, images: [] });
    expect(result.success).toBe(false);
  });

  it('rejects more than 6 images', () => {
    const urls = Array.from({ length: 7 }, (_, i) => `https://example.com/img${i}.jpg`);
    const result = createListingSchema.safeParse({ ...validListing, images: urls });
    expect(result.success).toBe(false);
  });

  it('rejects invalid condition enum', () => {
    const result = createListingSchema.safeParse({ ...validListing, condition: 'BROKEN' });
    expect(result.success).toBe(false);
  });

  it('rejects stock of 0', () => {
    const result = createListingSchema.safeParse({ ...validListing, stock: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects stock exceeding 999', () => {
    const result = createListingSchema.safeParse({ ...validListing, stock: 1000 });
    expect(result.success).toBe(false);
  });
});

// ─── Search Listings Schema ─────────────────────────────────────
describe('searchListingsSchema', () => {
  it('accepts an empty query (browse all)', () => {
    const result = searchListingsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sort).toBe('newest');
      expect(result.data.limit).toBe(20);
    }
  });

  it('accepts valid search parameters', () => {
    const result = searchListingsSchema.safeParse({
      q: 'macbook',
      category: 'laptops',
      condition: 'NEW',
      minPrice: '100',
      maxPrice: '5000',
      sort: 'price_asc',
      limit: '10',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      // Coerced from string to number
      expect(result.data.minPrice).toBe(100);
      expect(result.data.maxPrice).toBe(5000);
      expect(result.data.limit).toBe(10);
    }
  });

  it('rejects limit exceeding 50', () => {
    const result = searchListingsSchema.safeParse({ limit: '51' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid sort value', () => {
    const result = searchListingsSchema.safeParse({ sort: 'random' });
    expect(result.success).toBe(false);
  });
});

// ─── Create Order Schema ────────────────────────────────────────
describe('createOrderSchema', () => {
  it('accepts a valid order', () => {
    const result = createOrderSchema.safeParse({
      listingId: 'cm1abc123def456ghi789jkl',
      quantity: 1,
      deliveryMode: 'CAMPUS_MEETUP',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid deliveryMode', () => {
    const result = createOrderSchema.safeParse({
      listingId: 'cm1abc123def456ghi789jkl',
      deliveryMode: 'DRONE',
    });
    expect(result.success).toBe(false);
  });
});

// ─── Create Review Schema ───────────────────────────────────────
describe('createReviewSchema', () => {
  it('accepts a valid review', () => {
    const result = createReviewSchema.safeParse({
      orderId: 'cm1abc123def456ghi789jkl',
      rating: 5,
      comment: 'Great product!',
    });
    expect(result.success).toBe(true);
  });

  it('rejects rating below 1', () => {
    const result = createReviewSchema.safeParse({
      orderId: 'cm1abc123def456ghi789jkl',
      rating: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects rating above 5', () => {
    const result = createReviewSchema.safeParse({
      orderId: 'cm1abc123def456ghi789jkl',
      rating: 6,
    });
    expect(result.success).toBe(false);
  });
});

// ─── Send Message Schema ────────────────────────────────────────
describe('sendMessageSchema', () => {
  it('accepts a valid message', () => {
    const result = sendMessageSchema.safeParse({
      content: 'Is this item still available?',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty content', () => {
    const result = sendMessageSchema.safeParse({
      content: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects content exceeding 2000 characters', () => {
    const result = sendMessageSchema.safeParse({
      content: 'x'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

// ─── Create Dispute Schema ──────────────────────────────────────
describe('createDisputeSchema', () => {
  it('accepts a valid dispute', () => {
    const result = createDisputeSchema.safeParse({
      orderId: 'cm1abc123def456ghi789jkl',
      reason: 'ITEM_NOT_RECEIVED',
      description: 'I have not received my item after 14 days.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid dispute reason', () => {
    const result = createDisputeSchema.safeParse({
      orderId: 'cm1abc123def456ghi789jkl',
      reason: 'I_AM_ANGRY',
      description: 'A long enough description for the dispute.',
    });
    expect(result.success).toBe(false);
  });

  it('rejects description shorter than 20 characters', () => {
    const result = createDisputeSchema.safeParse({
      orderId: 'cm1abc123def456ghi789jkl',
      reason: 'NOT_AS_DESCRIBED',
      description: 'Too short',
    });
    expect(result.success).toBe(false);
  });
});
