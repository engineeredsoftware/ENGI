import {
  isValidWaitlistEmail,
  isWaitlistRole,
  normalizeWaitlistEmail,
  normalizeWaitlistRoles,
  validateWaitlistSubmit,
} from '@/components/marketing/MarketingLandingWaitlist/marketing-waitlist-validate';

describe('marketing waitlist validate', () => {
  it('normalizes and accepts valid emails', () => {
    expect(normalizeWaitlistEmail('  You@Company.COM ')).toBe('you@company.com');
    expect(isValidWaitlistEmail('you@company.com')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidWaitlistEmail('')).toBe(false);
    expect(isValidWaitlistEmail('not-an-email')).toBe(false);
    expect(isValidWaitlistEmail('@x.com')).toBe(false);
  });

  it('accepts multi-select roles only (no both)', () => {
    expect(isWaitlistRole('seller')).toBe(true);
    expect(isWaitlistRole('buyer')).toBe(true);
    expect(isWaitlistRole('builder')).toBe(true);
    expect(isWaitlistRole('both')).toBe(false);
    expect(isWaitlistRole('admin')).toBe(false);
  });

  it('normalizes multi-select roles with order and dedupe', () => {
    expect(normalizeWaitlistRoles(['builder', 'seller', 'seller', 'buyer'])).toEqual([
      'seller',
      'buyer',
      'builder',
    ]);
    expect(normalizeWaitlistRoles(['both', 'nope'])).toEqual([]);
  });

  it('validateWaitlistSubmit allows empty roles (email only)', () => {
    expect(
      validateWaitlistSubmit({ email: 'a@b.co', roles: ['buyer', 'seller'] }),
    ).toEqual({ ok: true, email: 'a@b.co', roles: ['seller', 'buyer'] });

    expect(validateWaitlistSubmit({ email: 'a@b.co', roles: [] })).toEqual({
      ok: true,
      email: 'a@b.co',
      roles: [],
    });
    expect(validateWaitlistSubmit({ email: 'a@b.co' })).toEqual({
      ok: true,
      email: 'a@b.co',
      roles: [],
    });
    expect(validateWaitlistSubmit({ email: 'bad', roles: ['buyer'] }).ok).toBe(false);
    expect(
      validateWaitlistSubmit({
        email: 'a@b.co',
        roles: ['buyer'],
        website: 'http://spam',
      }).ok,
    ).toBe(false);
  });
});

