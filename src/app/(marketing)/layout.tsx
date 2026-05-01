// Shared layout for marketing sub-pages (/pricing, /privacy, /terms, etc.)
// The root landing page (/) lives in src/app/page.tsx to avoid a route conflict.
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
