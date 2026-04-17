import { Router } from "express";
import { Resend } from "resend";
import { z } from "zod";
import { logger } from "../lib/logger";

const router: Router = Router();
const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

const subscribeSchema = z.object({
  email: z.string().email(),
});

router.post("/subscribe", async (req, res) => {
  try {
    const parsed = subscribeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid email address provided.",
      });
    }

    // Send a welcome email or add contact to audience via Resend
    // Currently relying on resend.contacts.create, or resend.emails.send based on the user's config
    try {
      await resend.emails.send({
        from: "U-Shop <hello@ushopgh.com>",
        to: [parsed.data.email],
        subject: "Welcome to the U-Shop Newsletter!",
        html: `
          <div style="font-family: sans-serif; text-align: center; padding: 40px; background: #f8fafc;">
            <h1 style="color: #6B1FA8;">Welcome to U-Shop!</h1>
            <p style="color: #333; font-size: 16px;">
              Thanks for subscribing. You'll be the first to know about exclusive student tech deals on your campus.
            </p>
          </div>
        `,
      });
      logger.info({ email: parsed.data.email }, "Successfully processed newsletter subscription via Resend.");
    } catch (apiError) {
      logger.error({ err: apiError }, "Failed to push to Resend.");
      // We do not fail the request if Resend isn't configured, just to prevent client-side breakages
    }

    return res.status(200).json({ success: true, message: "Subscribed successfully" });
  } catch (error) {
    logger.error({ err: error }, "Newsletter subscription exception");
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

export default router;
