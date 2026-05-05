import DodoPayments from "dodopayments";

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment: "live_mode",
});

export default dodo;

export type Plan = "starter" | "pro" | "agency";
export type BillingInterval = "monthly" | "yearly";

// ── Product ID map: fill from your Dodo Payments dashboard ───────────────────
// Each plan × interval pair = one Dodo product.
export const PLAN_PRODUCTS: Record<Plan, Record<BillingInterval, string>> = {
  starter: {
    monthly: process.env.DODO_PRODUCT_STARTER_MONTHLY ?? "",
    yearly:  process.env.DODO_PRODUCT_STARTER_YEARLY  ?? "",
  },
  pro: {
    monthly: process.env.DODO_PRODUCT_PRO_MONTHLY ?? "",
    yearly:  process.env.DODO_PRODUCT_PRO_YEARLY  ?? "",
  },
  agency: {
    monthly: process.env.DODO_PRODUCT_AGENCY_MONTHLY ?? "",
    yearly:  process.env.DODO_PRODUCT_AGENCY_YEARLY  ?? "",
  },
};

// Reverse lookup used by the webhook handler
export const PRODUCT_TO_PLAN: Record<string, Plan> = Object.fromEntries(
  (Object.entries(PLAN_PRODUCTS) as [Plan, Record<BillingInterval, string>][]).flatMap(
    ([plan, intervals]) =>
      Object.values(intervals)
        .filter(Boolean)
        .map((productId) => [productId, plan])
  )
);
