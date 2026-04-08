import { prisma } from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
import type { CreateListingInput, SearchListingsInput, UpdateListingInput } from '@ushop/shared';

export class ListingService {
  /**
   * Retrieves paginated listings executing exact match checks and text-vector
   * searches strictly mapping database limits.
   */
  static async searchListings(params: SearchListingsInput) {
    const {
      q,
      category,
      condition,
      minPrice,
      maxPrice,
      sellerType,
      storeId,
      sort = 'newest',
      limit = 20,
      cursor,
    } = params;

    // Use Prisma Query builder natively unless full-text is executed mapping custom properties
    if (q) {
      // Execute raw tsvector query
      const formattedQuery = q.trim().split(' ').map(term => `${term}:*`).join(' & ');
      
      const queryParams: unknown[] = [formattedQuery];
      let sqlConditions = `WHERE "status" = 'ACTIVE' AND "stock" > 0 AND "searchVector" @@ to_tsquery($1)`;
      
      let paramCount = 1;

      if (category) {
        paramCount++;
        sqlConditions += ` AND "categoryId" = $${paramCount}`;
        queryParams.push(category);
      }

      if (condition) {
        paramCount++;
        sqlConditions += ` AND "condition" = $${paramCount}::"ListingCondition"`;
        queryParams.push(condition);
      }

      if (storeId) {
        paramCount++;
        sqlConditions += ` AND "storeId" = $${paramCount}`;
        queryParams.push(storeId);
      }

      if (minPrice) {
        paramCount++;
        sqlConditions += ` AND "price" >= $${paramCount}`;
        queryParams.push(minPrice);
      }

      if (maxPrice) {
        paramCount++;
        sqlConditions += ` AND "price" <= $${paramCount}`;
        queryParams.push(maxPrice);
      }

      let orderBy = `ORDER BY "createdAt" DESC`;
      if (sort === 'price_asc') orderBy = `ORDER BY "price" ASC`;
      if (sort === 'price_desc') orderBy = `ORDER BY "price" DESC`;

      const listings = await prisma.$queryRawUnsafe(
        `SELECT id, "storeId", "categoryId", title, description, price, condition, images, "createdAt" 
         FROM "Listing" 
         ${sqlConditions}
         ${orderBy} 
         LIMIT ${limit}`
      , ...queryParams);
      
      return listings;
    }

    // Standard Prisma native querying (when Q is absent)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      status: 'ACTIVE',
      stock: { gt: 0 },
    };

    if (category) where.categoryId = category;
    if (condition) where.condition = condition;
    if (storeId) where.storeId = storeId;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    if (sellerType) {
      where.store = { sellerType: sellerType === 'student' ? 'STUDENT' : 'RESELLER' };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    // We mock "rating" since it's mapped to the Store actually
    
    return await prisma.listing.findMany({
      where,
      orderBy,
      take: limit,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      include: {
        store: { select: { handle: true, name: true, logoUrl: true, user: { select: { verificationStatus: true } } } },
      }
    });
  }

  /**
   * Fetches an isolated detailed record
   */
  static async getListingById(id: string) {
    return await prisma.listing.findUnique({
      where: { id },
      include: {
        store: {
          select: { name: true, handle: true, logoUrl: true, averageRating: true, reviewCount: true, returnWindow: true, sellerType: true, user: { select: { verificationStatus: true } } }
        },
        category: { select: { name: true, slug: true } }
      }
    });
  }

  /**
   * Create a new Listing attached to the User's active store
   */
  static async createListing(userId: string, data: CreateListingInput) {
    // Look up the store directly resolving ownership efficiently
    const store = await prisma.store.findUnique({ where: { userId }, select: { id: true } });
    
    if (!store) {
      throw new Error("You must create a store before publishing listings.");
    }

    // We use a transaction to insert the DB and artificially inject the search Vector
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const listing = await tx.listing.create({
        data: {
          storeId: store.id,
          categoryId: data.categoryId,
          title: data.title,
          description: data.description,
          price: data.price,
          condition: data.condition,
          stock: data.stock,
          images: data.images,
          status: 'ACTIVE' // Start auto-active
        }
      });

      // Update tsvector field safely parsing text bodies
      const updateVectorQuery = `
        UPDATE "Listing"
        SET "searchVector" = to_tsvector('english', $1 || ' ' || $2)
        WHERE id = $3
      `;
      
      await tx.$executeRawUnsafe(updateVectorQuery, data.title, data.description, listing.id);

      return listing;
    });
  }

  /**
   * Edit an active Listing making sure user owns it
   */
  static async updateListing(userId: string, id: string, data: UpdateListingInput) {
    const existing = await prisma.listing.findUnique({
      where: { id },
      select: { store: { select: { userId: true } } }
    });

    if (!existing || existing.store.userId !== userId) {
      throw new Error("Listing not found or you do not have permission to edit it.");
    }

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.listing.update({
        where: { id },
        data: data as Record<string, unknown>, // dynamic schema mapping safely executed by schema
      });

      // Patch the vector index if title or descript was altered
      if (data.title || data.description) {
        await tx.$executeRawUnsafe(`
          UPDATE "Listing"
          SET "searchVector" = to_tsvector('english', title || ' ' || description)
          WHERE id = $1
        `, id);
      }

      return updated;
    });
  }

  static async deleteListing(userId: string, id: string) {
    const existing = await prisma.listing.findUnique({
      where: { id },
      select: { store: { select: { userId: true } } }
    });

    if (!existing || existing.store.userId !== userId) {
      throw new Error("Listing not found or permission denied.");
    }

    await prisma.listing.delete({ where: { id } });
    return true;
  }
}
