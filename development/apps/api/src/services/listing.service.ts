import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import type { CreateListingInput, SearchListingsInput, UpdateListingInput } from '@ushop/shared';
import { CacheService } from './cache.service';
import crypto from 'crypto';

export class ListingService {
  /**
   * Retrieves paginated listings executing exact match checks and text-vector
   * searches strictly mapping database limits.
   */
  static async searchListings(params: SearchListingsInput & { buyerUniversity?: string; categorySlug?: string }) {
    // 1. Try to fetch from cache first
    // We normalize, sort, and stringify the params then hash to create a unique ID for this specific search query
    const normalizedParams = Object.keys(params)
      .filter((k) => params[k as keyof typeof params] !== undefined && params[k as keyof typeof params] !== null)
      .sort()
      .reduce((obj, key) => {
        obj[key] = params[key as keyof typeof params];
        return obj;
      }, {} as Record<string, unknown>);
      
    const cacheId = crypto.createHash('sha256').update(JSON.stringify(normalizedParams)).digest('hex').slice(0, 16);
    const cachedResults = await CacheService.get<unknown[]>('search', cacheId);
    
    if (cachedResults) {
      return cachedResults;
    }

    const {
      q,
      category,
      categorySlug,
      condition,
      minPrice,
      maxPrice,
      sellerType,
      storeId,
      sort, // ignoring native sorts if custom ranking applies, else we override
      limit = 20,
      cursor,
      buyerUniversity
    } = params;

    const queryParams: unknown[] = [];
    let paramCount = 0;

    let sqlConditions = `WHERE l."status" = 'ACTIVE' AND l."stock" > 0`;

    // 1. Text Search Filtering
    if (q && q.trim() !== '') {
      const formattedQuery = q.trim().split(' ').map(term => `${term.replace(/[^a-zA-Z0-9]/g, '')}:*`).join(' & ');
      paramCount++;
      // We use COALESCE to ensure that even if searchVector is NULL (legacy data), we don't break the query.
      // However, we want to match only if the vector exists or if we fall back to title ILIKE.
      sqlConditions += ` AND (l."searchVector" @@ to_tsquery($${paramCount}) OR l."title" ILIKE $${paramCount + 1})`;
      queryParams.push(formattedQuery);
      queryParams.push(`%${q.trim()}%`);
      paramCount++;
    }

    // 2. Exact Filters
    if (category) {
      paramCount++;
      sqlConditions += ` AND l."categoryId" = $${paramCount}`;
      queryParams.push(category);
    }

    if (categorySlug) {
      paramCount++;
      sqlConditions += ` AND l."categoryId" IN (SELECT id FROM "Category" WHERE slug = $${paramCount})`;
      queryParams.push(categorySlug);
    }

    if (condition) {
      paramCount++;
      sqlConditions += ` AND l."condition" = $${paramCount}::"ListingCondition"`;
      queryParams.push(condition);
    }

    if (storeId) {
      paramCount++;
      sqlConditions += ` AND l."storeId" = $${paramCount}`;
      queryParams.push(storeId);
    }

    if (minPrice) {
      paramCount++;
      sqlConditions += ` AND l."price" >= $${paramCount}`;
      queryParams.push(minPrice);
    }

    if (maxPrice) {
      paramCount++;
      sqlConditions += ` AND l."price" <= $${paramCount}`;
      queryParams.push(maxPrice);
    }

    if (sellerType) {
      paramCount++;
      sqlConditions += ` AND s."sellerType" = $${paramCount}::"SellerType"`;
      queryParams.push(sellerType === 'student' ? 'STUDENT' : 'RESELLER');
    }

    // Cursor pagination (using ID simply)
    if (cursor) {
      paramCount++;
      sqlConditions += ` AND l."id" < $${paramCount}`; // Assuming ID descending or we use createdAt
      queryParams.push(cursor);
    }

    // 3. Custom Algorithmic Sorting
    // Verified Stores + Local Availability + Price Competitiveness
    
    // Add logic params for equation
    // qParamIndex is not needed — the ts_rank ternary references $1 directly when q is present.

    let uniParamIndex = '0';
    if (buyerUniversity) {
      paramCount++;
      queryParams.push(buyerUniversity);
      uniParamIndex = `$${paramCount}`;
    } else {
      // Dummy param to prevent syntax error, never matched because index 0 doesn't exist
    }

    const rankingEquation = `
      (
        ${q ? `(ts_rank(l."searchVector", to_tsquery($1)) * 50)` : '0'} +
        (CASE WHEN u."verificationStatus" = 'VERIFIED' THEN 20 ELSE 0 END) +
        (CASE WHEN ${buyerUniversity ? `u."universityName" = ${uniParamIndex}` : 'false'} THEN 15 ELSE 0 END) +
        (10000.0 / (l.price + 1))
      )
    `;

    // 4. Overrides
    let orderBy = `ORDER BY ranking_score DESC, l."createdAt" DESC`;
    if (sort === 'price_asc') orderBy = `ORDER BY l."price" ASC`;
    if (sort === 'price_desc') orderBy = `ORDER BY l."price" DESC`;
    if (sort === 'newest') orderBy = `ORDER BY l."createdAt" DESC`;

    const rawSql = `
      SELECT 
        l.id, l."storeId", l."categoryId", l.title, l.description, l.price, l.condition, l.images, l."createdAt",
        s.handle as "storeHandle", s.name as "storeName", s."logoUrl" as "storeLogo",
        u."verificationStatus" as "storeVerification",
        ${rankingEquation} as ranking_score
      FROM "Listing" l
      JOIN "Store" s ON l."storeId" = s.id
      JOIN "User" u ON s."userId" = u.id
      ${sqlConditions}
      ${orderBy}
      LIMIT $${++paramCount}
    `;

    queryParams.push(limit);
    
    interface RawListingResult {
      id: string;
      storeId: string;
      categoryId: string;
      title: string;
      description: string;
      price: number;
      condition: string;
      images: string[];
      createdAt: Date;
      ranking_score: number;
      storeHandle: string;
      storeName: string;
      storeLogo: string | null;
      storeVerification: string;
    }

    const records = (await prisma.$queryRawUnsafe(rawSql, ...queryParams)) as RawListingResult[];
    
    // Auto-map records to standard Prisma output shape so the frontend doesn't break
    const results = records.map(r => ({
      id: r.id,
      storeId: r.storeId,
      categoryId: r.categoryId,
      title: r.title,
      description: r.description,
      price: r.price,
      condition: r.condition,
      images: r.images,
      createdAt: r.createdAt,
      ranking_score: r.ranking_score,
      store: {
         handle: r.storeHandle,
         name: r.storeName,
         logoUrl: r.storeLogo,
         user: { verificationStatus: r.storeVerification }
      }
    }));

    // 2. Store in cache for 5 minutes (300 seconds) for populated results, 
    // or 30 seconds for empty results to prevent repeated DB hammering.
    const ttl = results.length > 0 ? 300 : 30;
    await CacheService.set('search', cacheId, results, ttl);

    return results;
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

    // Find category resolving slug dynamically from frontend components or raw ID
    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { id: data.categoryId },
          { slug: data.categoryId }
        ]
      },
      select: { id: true }
    });

    if (!category) {
      throw new Error(`Invalid category reference: ${data.categoryId}`);
    }

    // We use a transaction to insert the DB and artificially inject the search Vector
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const listing = await tx.listing.create({
        data: {
          storeId: store.id,
          categoryId: category.id,
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
