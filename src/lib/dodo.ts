import DodoPayments from "dodopayments";

export type Plan = "starter" | "pro" | "agency";
export type BillingInterval = "monthly" | "yearly";

// Lazy singleton — instantiated on first call, not at module load time.
// This prevents build-time crashes when env vars are only available at runtime.
let _client: DodoPayments | null = null;
export function getDodoClient(): DodoPayments {
  if (!_client) {
    _client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
      environment: "live_mode",
    });
  }
  return _client;
}

// ── Product ID map: fill from your Dodo Payments dashboard ───────────────────
export function getPlanProducts(): Record<Plan, Record<BillingInterval, string>> {
  return {
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
}

// Reverse lookup: product_id → plan (used by webhook handler)
export function getProductToPlan(): Record<string, Plan> {
  return Object.fromEntries(
    (Object.entries(getPlanProducts()) as [Plan, Record<BillingInterval, string>][]).flatMap(
      ([plan, intervals]) =>
        Object.values(intervals)
          .filter(Boolean)
          .map((productId) => [productId, plan])
    )
  );
}
