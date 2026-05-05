import Link from "next/link";
import { Zap } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Terms of Service — HeatRank AI",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-white/[0.05] border border-white/[0.10]">
              <Zap className="w-3.5 h-3.5 text-zinc-300" />
            </div>
            <span className="text-sm font-semibold text-zinc-100">HeatRank AI</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Terms of Service</h1>
        <p className="text-zinc-500 text-sm mb-10">
          Last updated: May 4, 2026
        </p>

        <section className="space-y-6 text-zinc-400 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-zinc-200 mb-2">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using HeatRank AI, you agree to these Terms of Service.
              If you do not agree, please do not use the service.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-200 mb-2">2. Use of the Service</h2>
            <p>
              You may use HeatRank AI only for lawful purposes and in accordance with these Terms.
              You agree not to use the service to violate any applicable law, harm other users,
              or interfere with the operation of the platform.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-200 mb-2">3. Account Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials.
              You are responsible for all activity that occurs under your account. Notify us
              immediately at{" "}
              <a
                href="mailto:supportheatrakai@gmail.com"
                className="text-zinc-300 underline underline-offset-2 hover:text-white"
              >
                supportheatrakai@gmail.com
              </a>{" "}
              if you suspect unauthorized access.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-200 mb-2">4. Subscriptions and Billing</h2>
            <p>
              Paid plans are billed monthly. You may cancel at any time; cancellation takes effect
              at the end of the current billing period. We do not offer prorated refunds for partial
              months, except where required by law.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-200 mb-2">5. AI-Generated Content</h2>
            <p>
              HeatRank AI uses AI (Google Gemini) to generate keyword suggestions, review replies,
              and SEO recommendations. This content is provided as-is. You are responsible for
              reviewing AI-generated content before publishing it or relying on it for business
              decisions. We make no guarantees regarding ranking outcomes.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-200 mb-2">6. Third-Party APIs</h2>
            <p>
              Some features require connecting your Google Business Profile. Your use of Google
              services is subject to Google&apos;s own Terms of Service. We are not responsible for
              changes to Google&apos;s APIs or policies that affect our service.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-200 mb-2">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, HeatRank AI shall not be liable for any
              indirect, incidental, or consequential damages arising from your use of the service,
              including but not limited to loss of revenue or search rankings.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-200 mb-2">8. Changes to Terms</h2>
            <p>
              We may update these Terms at any time. We will notify you of material changes at least
              14 days in advance via email or in-app notice. Continued use of the service after
              changes take effect constitutes acceptance of the updated Terms.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-200 mb-2">9. Contact</h2>
            <p>
              Questions about these Terms? Email us at{" "}
              <a
                href="mailto:supportheatrakai@gmail.com"
                className="text-zinc-300 underline underline-offset-2 hover:text-white"
              >
                supportheatrakai@gmail.com
              </a>
              .
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] mt-16">
        <div className="max-w-3xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-zinc-700">
          <p>© {new Date().getFullYear()} HeatRank AI</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy</Link>
            <Link href="/" className="hover:text-zinc-400 transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
