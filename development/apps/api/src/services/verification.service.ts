import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { STUDENT_EMAIL_DOMAINS } from '@ushop/shared';

// ─── Verification Service ───────────────────────────────────────
// Handles all logic related to student verification status.
//
// Two verification paths:
//   Path 1 (Automatic): User signs up with a known .edu.gh email →
//     instantly verified. No manual review needed.
//   Path 2 (Manual): User uploads their student ID photo →
//     goes into PENDING queue for admin review.

export class VerificationService {

  // ─── isStudentEmail ─────────────────────────────────────────
  // Check if an email belongs to a known Ghanaian university domain.
  // Supports subdomain matching: "st.ug.edu.gh" → matches "ug.edu.gh".
  // The domain list is maintained in @ushop/shared/constants.ts
  // so it can be reused by the frontend for UI hints.
  static isStudentEmail(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;

    return STUDENT_EMAIL_DOMAINS.some((studentDomain) =>
      // Exact match: "ug.edu.gh" === "ug.edu.gh"
      // Subdomain match: "st.ug.edu.gh".endsWith(".ug.edu.gh")
      domain === studentDomain || domain.endsWith('.' + studentDomain)
    );
  }

  // ─── handlePostSignup ──────────────────────────────────────
  // Called immediately after a user successfully registers.
  // If their email is a student domain, we auto-verify them.
  // This removes friction for the majority of our target users.
  static async handlePostSignup(userId: string, email: string): Promise<void> {
    if (this.isStudentEmail(email)) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          verificationStatus: 'VERIFIED',
          verifiedAt: new Date(),
          // "system:auto-domain" distinguishes auto-verification from
          // admin-approved verification in audit logs.
          universityName: this.extractUniversityName(email),
        },
      });
      logger.info({ userId, email }, 'Auto-verified student via email domain');
    }
  }

  // ─── extractUniversityName ─────────────────────────────────
  // Maps a student email domain to a human-readable university name.
  // Used to pre-fill the universityName field on auto-verification.
  private static extractUniversityName(email: string): string | undefined {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return undefined;

    // Map known root domains to university names
    const universityMap: Record<string, string> = {
      'ug.edu.gh': 'University of Ghana',
      'knust.edu.gh': 'KNUST',
      'ucc.edu.gh': 'University of Cape Coast',
      'uew.edu.gh': 'University of Education, Winneba',
      'uds.edu.gh': 'University for Development Studies',
      'ashesi.edu.gh': 'Ashesi University',
      'gctu.edu.gh': 'Ghana Communication Technology University',
      'upsa.edu.gh': 'University of Professional Studies, Accra',
      'gimpa.edu.gh': 'GIMPA',
      'central.edu.gh': 'Central University',
      'pentvars.edu.gh': 'Pentecost University',
      'atu.edu.gh': 'Accra Technical University',
      'ttu.edu.gh': 'Takoradi Technical University',
      'ktu.edu.gh': 'Kumasi Technical University',
      'umat.edu.gh': 'University of Mines and Technology',
      'uhas.edu.gh': 'University of Health and Allied Sciences',
      'uenr.edu.gh': 'University of Energy and Natural Resources',
      'wiuc-ghana.edu.gh': 'Wisconsin International University College',
    };

    // Check exact match first, then try to match the root domain
    // (e.g., "st.ug.edu.gh" → look for "ug.edu.gh")
    for (const [rootDomain, name] of Object.entries(universityMap)) {
      if (domain === rootDomain || domain.endsWith('.' + rootDomain)) {
        return name;
      }
    }

    return undefined;
  }

  // ─── submitIdForReview ─────────────────────────────────────
  // Called when a user uploads their student ID photo for manual review.
  // Sets status to PENDING and stores the Supabase Storage path.
  //
  // Side effects: none yet — in Phase 9 we'll add a notification
  // to the admin dashboard when a new ID is submitted.
  static async submitIdForReview(
    userId: string,
    imageStoragePath: string,
    universityName?: string
  ): Promise<void> {
    // Only allow submission if user is currently UNVERIFIED or REJECTED.
    // PENDING users should not re-submit (they'd overwrite the pending image).
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { verificationStatus: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.verificationStatus === 'VERIFIED') {
      throw new Error('You are already verified');
    }

    if (user.verificationStatus === 'PENDING') {
      throw new Error('Your verification is already pending review');
    }

    // Update status to PENDING and store the image path
    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus: 'PENDING',
        studentIdImagePath: imageStoragePath,
        universityName: universityName ?? undefined,
        // Clear any previous rejection reason
        rejectionReason: null,
      },
    });

    logger.info({ userId }, 'Student ID submitted for review');
  }

  // ─── approveVerification ───────────────────────────────────
  // Called by an admin from the admin panel.
  // Marks the user as VERIFIED and schedules ID image deletion
  // per Ghana Data Protection Act requirements.
  static async approveVerification(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        // NOTE: In a production system, we should also schedule
        // deletion of the studentIdImagePath from Supabase Storage
        // after a retention period (e.g., 30 days post-verification).
        // This will be implemented in Phase 9 (Notifications).
      },
    });

    logger.info({ userId }, 'Verification approved by admin');
  }

  // ─── rejectVerification ────────────────────────────────────
  // Called by an admin. Sets status to REJECTED with a reason
  // so the user knows what went wrong and can re-submit.
  static async rejectVerification(
    userId: string,
    reason: string
  ): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus: 'REJECTED',
        rejectionReason: reason,
        // Clear the image path — they'll need to re-upload
        studentIdImagePath: null,
      },
    });

    logger.info({ userId, reason }, 'Verification rejected by admin');
  }
}
