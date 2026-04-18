import DOMPurify from 'isomorphic-dompurify';

// ─── Input Sanitisation Middleware ──────────────────────────────
// Defence-in-depth against XSS via user-generated content.
// Applied AFTER Zod validation, BEFORE any DB write.
//
// Two levels:
//   sanitizePlainText() — strips ALL HTML (store names, handles, bios)
//   sanitizeRichText()  — allowlist of safe formatting tags
//
// Why not rely on React's default escaping alone?
// Because store bios are server-rendered for SEO (SSR'd HTML),
// and admin panels render dispute evidence. If injection happens
// at the DB layer, it affects every rendering surface.

// ─── sanitizePlainText ──────────────────────────────────────────
// Strips ALL HTML tags and attributes. Collapses whitespace.
// Use for: store name, store handle, store bio, listing title,
//          dispute description, user fullName.
export function sanitizePlainText(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    .trim()
    .replace(/\s+/g, ' ');
}

// ─── sanitizeRichText ───────────────────────────────────────────
// Allows a limited set of formatting tags (bold, italic, lists, paragraphs).
// Explicitly forbids dangerous tags (script, style, iframe, form, input).
// Use for: return policy notes, product descriptions.
export function sanitizeRichText(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'ul', 'ol', 'li', 'p'],
    ALLOWED_ATTR: [],
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'style'],
  });
}

import type { Request, Response, NextFunction } from 'express';

// ─── autoSanitizeBody ───────────────────────────────────────────
// Centralized Express Middleware to sanitize common text fields.
export function autoSanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    return next();
  }

  // Plain Text Fields
  const plainTextFields = ['name', 'handle', 'bio', 'title', 'ghanaCardName', 'fullName'];
  for (const field of plainTextFields) {
    if (typeof req.body[field] === 'string') {
      req.body[field] = sanitizePlainText(req.body[field]);
    }
  }

  // Rich Text Fields
  const richTextFields = ['description', 'policyNotes'];
  for (const field of richTextFields) {
    if (typeof req.body[field] === 'string') {
      req.body[field] = sanitizeRichText(req.body[field]);
    }
  }

  next();
}
