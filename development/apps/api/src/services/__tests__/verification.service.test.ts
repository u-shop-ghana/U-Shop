import { describe, it, expect } from 'vitest';
import { VerificationService } from '../verification.service';

// ─── VerificationService.isStudentEmail Tests ───────────────────
// Tests the pure logic for detecting student university email domains.
// This is a static method with no database dependency — it checks
// the email domain against the STUDENT_EMAIL_DOMAINS list from
// @ushop/shared/constants.ts.

describe('VerificationService.isStudentEmail', () => {
  it('returns true for a root university domain (ug.edu.gh)', () => {
    expect(VerificationService.isStudentEmail('kwame@ug.edu.gh')).toBe(true);
  });

  it('returns true for a subdomain (st.ug.edu.gh)', () => {
    expect(VerificationService.isStudentEmail('kwame@st.ug.edu.gh')).toBe(true);
  });

  it('returns true for KNUST emails', () => {
    expect(VerificationService.isStudentEmail('ama@knust.edu.gh')).toBe(true);
  });

  it('returns true for KNUST student subdomain', () => {
    expect(VerificationService.isStudentEmail('kofi@st.knust.edu.gh')).toBe(true);
  });

  it('returns true for Ashesi University', () => {
    expect(VerificationService.isStudentEmail('yaa@ashesi.edu.gh')).toBe(true);
  });

  it('returns true for UCC', () => {
    expect(VerificationService.isStudentEmail('test@ucc.edu.gh')).toBe(true);
  });

  it('returns true for GIMPA', () => {
    expect(VerificationService.isStudentEmail('student@gimpa.edu.gh')).toBe(true);
  });

  it('returns false for a personal Gmail address', () => {
    expect(VerificationService.isStudentEmail('kwame@gmail.com')).toBe(false);
  });

  it('returns false for a corporate email', () => {
    expect(VerificationService.isStudentEmail('info@techcorp.com')).toBe(false);
  });

  it('returns false for an unrecognized .edu.gh domain', () => {
    // This domain is plausible but not in our list
    expect(VerificationService.isStudentEmail('test@fakeuni.edu.gh')).toBe(false);
  });

  it('returns false for an email with no @ symbol', () => {
    expect(VerificationService.isStudentEmail('not-an-email')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(VerificationService.isStudentEmail('')).toBe(false);
  });

  it('is case-insensitive for the domain part', () => {
    // The method lowercases the domain before comparison
    expect(VerificationService.isStudentEmail('test@UG.EDU.GH')).toBe(true);
  });
});
