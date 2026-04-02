// ─── Student Email Domain Validation ────────────────────────────
// This is a local copy of STUDENT_EMAIL_DOMAINS from @ushop/shared.
//
// WHY: The shared package uses "moduleResolution": "NodeNext" which
// requires .js extensions in TypeScript imports. Turbopack (Next.js)
// cannot resolve these .js extensions to .ts source files in workspace
// packages. Rather than modifying the shared package (which would break
// the API's build), we maintain a local copy for the web frontend.
//
// This list MUST be kept in sync with:
//   packages/shared/src/constants.ts → STUDENT_EMAIL_DOMAINS
export const STUDENT_EMAIL_DOMAINS: string[] = [
  "ug.edu.gh",
  "st.ug.edu.gh",
  "knust.edu.gh",
  "st.knust.edu.gh",
  "ucc.edu.gh",
  "uew.edu.gh",
  "uds.edu.gh",
  "ashesi.edu.gh",
  "gctu.edu.gh",
  "upsa.edu.gh",
  "gimpa.edu.gh",
  "central.edu.gh",
  "pentvars.edu.gh",
  "atu.edu.gh",
  "ttu.edu.gh",
  "ktu.edu.gh",
  "umat.edu.gh",
  "uhas.edu.gh",
  "uenr.edu.gh",
  "wiuc-ghana.edu.gh",
];

// Check if a given email belongs to a Ghanaian university domain.
// Supports both exact domain matches and subdomain matches.
export function isStudentEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return STUDENT_EMAIL_DOMAINS.some(
    (d) => domain === d || domain.endsWith("." + d)
  );
}
