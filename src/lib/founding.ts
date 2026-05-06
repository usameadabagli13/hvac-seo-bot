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
// Real backend cap: this many actual signups receive the founder flag.
export const FOUNDING_TOTAL_SPOTS = 12;

// Social-proof offset shown to visitors. The displayed counter starts as
// if this many people had already claimed a spot, so a fresh visitor
// never sees "0 of N taken" (which signals "nobody else thinks this is
// worth it"). Doesn't affect who actually gets the founder flag — that's
// still gated by FOUNDING_TOTAL_SPOTS in the DB.
export const FOUNDING_DISPLAY_OFFSET = 21;
export const FOUNDING_DISPLAY_TOTAL  = FOUNDING_TOTAL_SPOTS + FOUNDING_DISPLAY_OFFSET; // 12 + 21 = 33
export const FOUNDING_DISCOUNT = "30%";
export const FOUNDING_DURATION_MONTHS = 12;

// Two coupons because Dodo charges by billing cycle:
//   - Yearly plan: 1 cycle == 12 months → FOUNDER30 (1 cycle)
//   - Monthly plan: 12 cycles == 12 months → FOUND30 (12 cycles)
// We send both in the welcome email and let the user pick at checkout.
export const FOUNDING_COUPON_YEARLY = "FOUNDER30";
export const FOUNDING_COUPON_MONTHLY = "FOUND30";

// Single legacy export so older callers (admin CSV, DB seed) keep compiling.
// Defaults to the yearly code since that's the longer-term commitment.
export const FOUNDING_COUPON_CODE = FOUNDING_COUPON_YEARLY;
