// ─── Global Type Declarations for U-Shop API ───────────────────
// This file extends Express's Request type to include our custom
// `user` property. It uses the standard @types/express augmentation
// pattern via 'declare global' + 'namespace Express'.
//
// This MUST be a .d.ts file (not .ts) so TypeScript treats it as
// an ambient declaration that merges into the global Express types.

declare namespace Express {
  interface Request {
    user?: {
      id: string;                 // Our database user ID (cuid)
      supabaseId: string;         // Supabase auth uid
      email: string;
      role: string;               // BUYER | SELLER | BOTH | ADMIN
      verificationStatus: string; // UNVERIFIED | PENDING | VERIFIED | REJECTED | EXPIRED
      isSuspended: boolean;
      storeId?: string;           // Present if user has a store
    };
  }
}
