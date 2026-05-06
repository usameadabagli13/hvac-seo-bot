export interface PlanFeature {
  text:     string;
  included: boolean;
}

export interface PlanCopy {
  name:         string;
  monthlyPrice: number;
  annualPrice:  number;
  desc:         string;
  cta:          string;
  ctaHref:      string;
  highlight:    boolean;
  features:     PlanFeature[];
}

export const PLANS: PlanCopy[] = [
  {
    name:         "Starter",
    monthlyPrice: 39,
    annualPrice:  32,
    desc:         "For solo contractors exploring SEO.",
    cta:          "Start 14-Day Trial",
    ctaHref:      "/login",
    highlight:    false,
    features: [
      { text: "1 business",                    included: true  },
      { text: "1 AI keyword generation / mo",  included: true  },
      { text: "3 AI review replies / mo",      included: true  },
      { text: "Basic schema markup",           included: true  },
      { text: "SEO audits",                    included: false },
      { text: "Rank snapshots",                included: false },
      { text: "Competitor tracking",           included: false },
      { text: "PDF reports",                   included: false },
    ],
  },
  {
    name:         "Pro",
    monthlyPrice: 69,
    annualPrice:  55,
    desc:         "Everything you need to dominate local search.",
    cta:          "Start 14-Day Free Trial",
    ctaHref:      "/login",
    highlight:    true,
    features: [
      { text: "5 businesses",                  included: true },
      { text: "Unlimited AI keywords",         included: true },
      { text: "Unlimited review replies",      included: true },
      { text: "Full schema markup",            included: true },
      { text: "Unlimited SEO audits",          included: true },
      { text: "Weekly rank snapshots",         included: true },
      { text: "Competitor tracking (3 rivals)", included: true },
      { text: "Weekly PDF reports",            included: true },
      { text: "Priority support",              included: true },
    ],
  },
  {
    name:         "Agency",
    monthlyPrice: 199,
    annualPrice:  159,
    desc:         "For agencies managing multiple HVAC clients.",
    cta:          "Contact Sales",
    ctaHref:      "/login",
    highlight:    false,
    features: [
      { text: "Unlimited businesses",            included: true },
      { text: "Unlimited AI keywords",           included: true },
      { text: "Unlimited review replies",        included: true },
      { text: "Full schema markup",              included: true },
      { text: "Unlimited SEO audits",            included: true },
      { text: "Daily rank snapshots",            included: true },
      { text: "Competitor tracking (10 rivals)", included: true },
      { text: "Daily PDF reports",               included: true },
      { text: "White-label reports",             included: true },
      { text: "Sub-account management",          included: true },
      { text: "Priority support",                included: true },
    ],
  },
];
