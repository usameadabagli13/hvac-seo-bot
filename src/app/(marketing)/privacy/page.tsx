import Link from "next/link";
import { Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — HVAC SEO Bot",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-white/[0.05] border border-white/[0.10]">
              <Zap className="w-3.5 h-3.5 text-zinc-300" />
            </div>
            <span className="text-sm font-semibold text-zinc-100">HVAC SEO Bot</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16 prose prose-invert prose-zinc max-w-none">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Privacy Policy</h1>
        <p className="text-zinc-500 text-sm mb-10">
          Last updated: May 4, 2026
        </p>

        <section className="space-y-6 text-zinc-400 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-zinc-200 mb-2">1. Information We Collect</h2>
            <p>
              When you create an account, we collect your email address and, optionally, your name.
              When you add a business, we store the business name, service location, website URL,
              and target keywords you provide. We also collect standard usage data such as feature
              interaction logs to improve the product.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-200 mb-2">2. Google APIs and User Data</h2>
            <p>
              HVAC SEO Bot uses Google APIs, including the Google Business Profile API and Google
              Places API, to fetch review data and local ranking information on your behalf.
            </p>
            <p className="mt-2">
              HVAC SEO Bot&apos;s use and transfer of information received from Google APIs to any
              other app adheres to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-300 underline underline-offset-2 hover:text-white"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements. We do not sell or share your Google account
              data with third parties.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-200 mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1.5 ml-1">
              <li>To provide the HVAC SEO Bot service and its features</li>
              <li>To generate AI-powered keyword suggestions and SEO recommendations</li>
              <li>To send product updates and account-related emails</li>
              <li>To detect and prevent abuse of the platform</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-200 mb-2">4. Data Storage and Security</h2>
            <p>
              Your data is stored on Supabase (PostgreSQL) with row-level security enforced at the
              database level. Each user account can only access its own data. Access tokens from
              Google OAuth are stored securely and are never exposed to other users.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-200 mb-2">5. Data Sharing</h2>
            <p>
              We do not sell your personal data. We share data only with the following service
              providers strictly as necessary to operate the platform:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-1 mt-2">
              <li>Supabase (database and authentication)</li>
              <li>Google (Gemini AI, Business Profile API, Places API)</li>
              <li>LemonSqueezy (payment processing)</li>
              <li>Vercel (hosting and edge network)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-200 mb-2">6. Your Rights</h2>
            <p>
              You may request deletion of your account and all associated data at any time from
              your account settings, or by emailing us at{" "}
              <a
                href="mailto:supportheatrankai@gmail.com"
                className="text-zinc-300 underline underline-offset-2 hover:text-white"
              >
                supportheatrankai@gmail.com
              </a>
              . We will process deletion requests within 30 days.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-200 mb-2">7. Changes to This Policy</h2>
            <p>
              We may update this policy as the product evolves. We will notify you by email or
              in-app notification of any material changes at least 14 days before they take effect.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-200 mb-2">8. Contact</h2>
            <p>
              Questions about this policy? Email us at{" "}
              <a
                href="mailto:supportheatrankai@gmail.com"
                className="text-zinc-300 underline underline-offset-2 hover:text-white"
              >
                supportheatrankai@gmail.com
              </a>
              .
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] mt-16">
        <div className="max-w-3xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-zinc-700">
          <p>© {new Date().getFullYear()} HVAC SEO Bot</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms</Link>
            <Link href="/" className="hover:text-zinc-400 transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
