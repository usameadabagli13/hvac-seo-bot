/**
 * Founding member program. First N signups get:
 *   - 30% off for the first 12 months (capped via the Dodo coupon)
 *   - A permanent "Founder" badge on their account (lifetime perk;
 *     priority support + early access to new features)
 *
 * The discount duration lives on the Dodo coupon itself — we just
 * surface it consistently in copy/emails. Don't bump the duration
 * here without updating the Dodo coupon configuration.
 */
export const FOUNDING_TOTAL_SPOTS    = 20;
export const FOUNDING_COUPON_CODE    = "FOUNDER30";
export const FOUNDING_DISCOUNT       = "30%";
export const FOUNDING_DURATION_MONTHS = 12;
