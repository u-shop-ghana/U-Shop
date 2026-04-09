import { Resend } from 'resend';
import { logger } from './logger';

// ─── Resend Email Client ────────────────────────────────────────
// Centralised email client using Resend. All transactional emails
// (order confirmations, store notifications, verification reminders,
// etc.) go through this service.
//
// Auth emails (signup confirmation, password reset, magic link)
// are handled by Supabase Auth's built-in SMTP integration —
// configured in the Supabase Dashboard under Authentication → SMTP.
// This service is for custom application-level emails only.
//
// IMPORTANT: Do NOT use this to duplicate Supabase Auth emails.
// Supabase manages its own email templates and delivery for auth flows.

// Validate that the API key is configured at startup
if (!process.env.RESEND_API_KEY) {
  logger.warn('RESEND_API_KEY is not set — email sending will fail at runtime');
}

// Singleton Resend client instance. The SDK is lightweight
// and stateless, so a single instance is safe for the app lifecycle.
const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender address — must be a verified domain in Resend.
// Falls back to the env var EMAIL_FROM if set; otherwise uses
// the Resend onboarding address for development.
const DEFAULT_FROM = process.env.EMAIL_FROM || 'U-Shop <onboarding@resend.dev>';

// ─── Email Sending Interface ────────────────────────────────────
interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;       // Override default sender
  replyTo?: string;    // Optional reply-to address
  tags?: Array<{ name: string; value: string }>; // Resend tags for tracking
}

// Send a single email via Resend. Returns the Resend message ID
// on success, or null on failure. Errors are logged but not thrown
// so callers can decide whether email failure is fatal.
export async function sendEmail(options: SendEmailOptions): Promise<string | null> {
  try {
    const { data, error } = await resend.emails.send({
      from: options.from || DEFAULT_FROM,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      reply_to: options.replyTo,
      tags: options.tags,
    });

    if (error) {
      logger.error(`Resend email failed: ${error.message}`, { error, to: options.to });
      return null;
    }

    logger.info(`Email sent successfully via Resend`, {
      messageId: data?.id,
      to: options.to,
      subject: options.subject,
    });

    return data?.id || null;
  } catch (err: unknown) {
    // Network errors, invalid API key, etc.
    const message = err instanceof Error ? err.message : 'Unknown email error';
    logger.error(`Resend email exception: ${message}`, { err, to: options.to });
    return null;
  }
}

// ─── Pre-built Email Templates ──────────────────────────────────
// These are convenience wrappers around sendEmail() for common
// transactional scenarios. Each one constructs branded HTML.

// Order confirmation email sent to the buyer after successful checkout
export async function sendOrderConfirmationEmail(
  buyerEmail: string,
  orderDetails: {
    orderId: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
    currency?: string;
  }
): Promise<string | null> {
  const currency = orderDetails.currency || 'GH₵';

  // Build the items HTML rows
  const itemsHtml = orderDetails.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee">${item.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${currency} ${item.price.toLocaleString()}</td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff">
      <div style="background:#520f85;padding:24px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">U-Shop</h1>
      </div>
      <div style="padding:32px 24px">
        <h2 style="color:#1a1a2e;margin:0 0 8px">Order Confirmed! 🎉</h2>
        <p style="color:#666;font-size:14px">Your order <strong>#${orderDetails.orderId}</strong> has been placed successfully.</p>
        
        <table style="width:100%;border-collapse:collapse;margin:24px 0">
          <thead>
            <tr style="border-bottom:2px solid #520f85">
              <th style="text-align:left;padding:8px 0;font-size:13px;color:#520f85">Item</th>
              <th style="text-align:center;padding:8px 0;font-size:13px;color:#520f85">Qty</th>
              <th style="text-align:right;padding:8px 0;font-size:13px;color:#520f85">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:12px 0;font-weight:bold;font-size:16px">Total</td>
              <td style="padding:12px 0;font-weight:bold;font-size:16px;text-align:right;color:#520f85">${currency} ${orderDetails.total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <p style="color:#666;font-size:13px">Your payment is held in escrow and will be released to the seller once you confirm delivery.</p>
        
        <a href="https://u-shop-eosin.vercel.app/dashboard" 
           style="display:inline-block;background:#520f85;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
          Track Your Order
        </a>
      </div>
      <div style="background:#f8fafc;padding:16px 24px;text-align:center;font-size:12px;color:#999">
        <p>U-Shop — Ghana's Student Tech Marketplace</p>
        <p>© 2026 U-Shop. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: buyerEmail,
    subject: `Order Confirmed — #${orderDetails.orderId}`,
    html,
    tags: [
      { name: 'type', value: 'order_confirmation' },
      { name: 'order_id', value: orderDetails.orderId },
    ],
  });
}

// Welcome email sent to newly verified students
export async function sendWelcomeEmail(
  email: string,
  name: string,
  university: string
): Promise<string | null> {
  const html = `
    <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff">
      <div style="background:#520f85;padding:24px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">U-Shop</h1>
      </div>
      <div style="padding:32px 24px">
        <h2 style="color:#1a1a2e;margin:0 0 8px">Welcome to U-Shop, ${name}! 🎓</h2>
        <p style="color:#666;font-size:14px">You've been verified as a student at <strong>${university}</strong>. You now have full access to campus-exclusive deals and features.</p>
        
        <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:24px 0">
          <h3 style="color:#520f85;margin:0 0 12px;font-size:16px">What you can do now:</h3>
          <ul style="color:#555;font-size:14px;padding-left:20px;margin:0">
            <li style="margin-bottom:8px">🛒 Buy tech from verified student sellers</li>
            <li style="margin-bottom:8px">🏪 Open your own store and start selling</li>
            <li style="margin-bottom:8px">🔒 Every purchase protected by escrow</li>
            <li>📦 Campus delivery to your hostel or hall</li>
          </ul>
        </div>

        <a href="https://u-shop-eosin.vercel.app/search" 
           style="display:inline-block;background:#520f85;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
          Start Shopping
        </a>
      </div>
      <div style="background:#f8fafc;padding:16px 24px;text-align:center;font-size:12px;color:#999">
        <p>U-Shop — Ghana's Student Tech Marketplace</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Welcome to U-Shop, ${name}! 🎓`,
    html,
    tags: [{ name: 'type', value: 'welcome' }],
  });
}

// Store approval notification sent to sellers
export async function sendStoreApprovedEmail(
  sellerEmail: string,
  storeName: string,
  storeHandle: string
): Promise<string | null> {
  const html = `
    <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff">
      <div style="background:#520f85;padding:24px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">U-Shop</h1>
      </div>
      <div style="padding:32px 24px">
        <h2 style="color:#1a1a2e;margin:0 0 8px">Your Store is Live! 🎉</h2>
        <p style="color:#666;font-size:14px">
          Great news — <strong>${storeName}</strong> has been approved and is now visible to students across Ghana.
        </p>
        
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:24px 0;text-align:center">
          <p style="color:#166534;font-weight:bold;margin:0 0 4px;font-size:16px">✅ Store Active</p>
          <p style="color:#166534;margin:0;font-size:14px">u-shop-eosin.vercel.app/store/${storeHandle}</p>
        </div>

        <a href="https://u-shop-eosin.vercel.app/dashboard" 
           style="display:inline-block;background:#520f85;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
          Manage Your Store
        </a>
      </div>
      <div style="background:#f8fafc;padding:16px 24px;text-align:center;font-size:12px;color:#999">
        <p>U-Shop — Ghana's Student Tech Marketplace</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: sellerEmail,
    subject: `🎉 ${storeName} is now live on U-Shop!`,
    html,
    tags: [
      { name: 'type', value: 'store_approved' },
      { name: 'store', value: storeHandle },
    ],
  });
}

// Export the raw resend client for advanced use cases
export { resend };
