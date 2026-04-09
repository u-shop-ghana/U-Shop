import { prisma } from '../lib/prisma';
import type { Prisma } from '@prisma/client';
import type { CreateStoreInput, UpdateStoreInput } from '@ushop/shared';

// The fields that require admin approval to update
const POLICY_FIELDS = [
  'returnWindow',
  'returnCondition',
  'returnShippingCost',
  'warrantyPeriod',
  'warrantyCoverage',
  'refundMethod',
  'policyNotes',
] as const;

export class StoreService {
  /**
   * Initializes a new store linked to the authenticated user.
   * Derives SellerType from their verificationType.
   */
  static async createStore(userId: string, data: CreateStoreInput) {
    // We use a Prisma interactive transaction here because we need to:
    // (a) fetch the user to check verification safely
    // (b) create the store row
    // (c) update the user role to BOTH (buyer + seller)
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      // Only VERIFIED users can open a store
      if (user.verificationStatus !== 'VERIFIED') {
        throw new Error('Must be fully verified to create a store.');
      }

      // Check if store already exists for user
      const existingStore = await tx.store.findUnique({ where: { userId } });
      if (existingStore) {
        throw new Error('User already has an active store.');
      }

      const sellerType =
        user.verificationType === 'GHANA_CARD' ? 'RESELLER' : 'STUDENT';

      // Create store
      const store = await tx.store.create({
        data: {
          userId,
          name: data.name,
          handle: data.handle.toLowerCase(),
          bio: data.bio,
          logoUrl: data.logoUrl,
          bannerUrl: data.bannerUrl,
          sellerType,
        },
      });

      // Update user role to BOTH if they are currently just BUYER
      if (user.role === 'BUYER') {
        await tx.user.update({
          where: { id: userId },
          data: { role: 'BOTH' },
        });
      }

      return store;
    });
  }

  static async getStoreById(id: string) {
    return await prisma.store.findUnique({ where: { id } });
  }

  /**
   * Update an existing store.
   * Any updates to policy fields are pushed into `pendingPolicyUpdates` instead of saving directly.
   */
  static async updateStore(storeId: string, data: UpdateStoreInput) {
    const rawData = { ...data } as Record<string, unknown>;

    // Separate direct updates from locked policy updates
    const directUpdates: Record<string, unknown> = {};
    const policyUpdates: Record<string, unknown> = {};

    let hasPolicyUpdates = false;

    // Filter fields into direct or policy updates
    Object.keys(rawData).forEach((key) => {
      if ((POLICY_FIELDS as readonly string[]).includes(key)) {
        policyUpdates[key] = rawData[key];
        hasPolicyUpdates = true;
      } else {
        directUpdates[key] = rawData[key];
      }
    });

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const store = await tx.store.findUnique({
        where: { id: storeId },
        select: { pendingPolicyUpdates: true },
      });
      if (!store) throw new Error('Store not found');

      // Merge brand new policy updates with existing pending ones
      if (hasPolicyUpdates) {
        const existingPending = store.pendingPolicyUpdates
          ? (typeof store.pendingPolicyUpdates === 'string'
              ? JSON.parse(store.pendingPolicyUpdates)
              : store.pendingPolicyUpdates)
          : {};
          
        directUpdates.pendingPolicyUpdates = {
          ...(existingPending as object),
          ...policyUpdates,
        };
      }

      return await tx.store.update({
        where: { id: storeId },
        data: directUpdates,
      });
    });
  }

  /**
   * Fetch a store explicitly by handle.
   */
  static async getStoreByHandle(handle: string) {
    const store = await prisma.store.findUnique({
      where: { handle: handle.toLowerCase() },
      include: {
        user: {
          select: { verificationStatus: true, verifiedAt: true, id: true },
        },
      },
    });
    
    if (!store) return null;

    // Remove sensitive user mapping fields before returning public API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { pendingPolicyUpdates, ...safeStore } = store;
    return safeStore;
  }

  /**
   * Retrieves active stores mapped for exploration index
   */
  static async listStores(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const stores = await prisma.store.findMany({
      where: { isActive: true },
      include: {
        user: { select: { verificationStatus: true, universityName: true } },
      },
      orderBy: [
        { averageRating: 'desc' },
        { reviewCount: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit,
    });

    const safeStores = stores.map(store => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { pendingPolicyUpdates, ...safe } = store;
      return safe;
    });

    return safeStores;
  }

  /**
   * Checks if a handle is strictly available.
   * @returns `true` if available, `false` otherwise
   */
  static async isHandleAvailable(handle: string) {
    const count = await prisma.store.count({
      where: {
        handle: {
          equals: handle.toLowerCase(),
        },
      },
    });
    return count === 0;
  }
}
