import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Clock, Calendar } from "lucide-react";
import { ARTICLES, getArticleBySlug } from "@/data/articles";

export const revalidate = 86400;

export async function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  return {
    title:       `${article.title} | HeatRank AI`,
    description: article.description,
    alternates:  { canonical: `/resources/${article.slug}` },
    openGraph: {
      title:       article.title,
      description: article.description,
      url:         `/resources/${article.slug}`,
      type:        "article",
      publishedTime: article.published,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const others = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3);

  const articleSchema = {
    "@context":      "https://schema.org",
    "@type":         "Article",
    "headline":      article.title,
    "description":   article.description,
    "datePublished": article.published,
    "dateModified":  article.published,
    "author":        { "@type": "Organization", "name": "HeatRank AI" },
    "publisher":     {
      "@type": "Organization",
      "name":  "HeatRank AI",
      "logo":  { "@type": "ImageObject", "url": "https://www.heatrankai.com/heatrank-logo.png" },
    },
    "mainEntityOfPage": `https://www.heatrankai.com/resources/${article.slug}`,
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <header className="border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/resources" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
            <ChevronLeft className="w-4 h-4" /> All resources
          </Link>
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/heatrank-logo.png" alt="HeatRank AI" width={28} height={28} className="rounded-xl w-7 h-7" />
            <span className="text-sm font-semibold text-zinc-100 tracking-tight">HeatRank<span className="text-zinc-400"> AI</span></span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-12 pb-16">
        <article>
          <p className="text-xs font-medium text-amber-400 uppercase tracking-widest mb-4">
            {article.category}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100 mb-5 leading-tight">
            {article.title}
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed mb-6">
            {article.description}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-600 pb-8 mb-10 border-b border-white/[0.06]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(article.published).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {article.readTime}
            </span>
          </div>

          <div className="space-y-5">
            {article.body.map((block, i) => {
              if (block.type === "p") {
                return (
                  <p key={i} className="text-base text-zinc-300 leading-relaxed">
                    {block.content as string}
                  </p>
                );
              }
              if (block.type === "h2") {
                return (
                  <h2 key={i} className="text-2xl font-semibold text-zinc-100 tracking-tight mt-8 mb-2">
                    {block.content as string}
                  </h2>
                );
              }
              if (block.type === "ul") {
                return (
                  <ul key={i} className="space-y-2 pl-1">
                    {(block.content as string[]).map((item, j) => (
                      <li key={j} className="flex items-start gap-3 text-base text-zinc-300 leading-relaxed">
                        <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              if (block.type === "ol") {
                return (
                  <ol key={i} className="space-y-2 pl-1 list-decimal list-inside">
                    {(block.content as string[]).map((item, j) => (
                      <li key={j} className="text-base text-zinc-300 leading-relaxed marker:text-amber-400 marker:font-semibold">
                        {item}
                      </li>
                    ))}
                  </ol>
                );
              }
              if (block.type === "callout") {
                return (
                  <aside key={i} className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-5 py-4 text-sm text-amber-200/90 leading-relaxed">
                    {block.content as string}
                  </aside>
                );
              }
              return null;
            })}
          </div>
        </article>

        {/* CTA */}
        <section className="mt-16">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] px-6 py-10 sm:px-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 tracking-tight mb-3">
              Tired of doing this manually?
            </h2>
            <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto leading-relaxed">
              HeatRank AI automates the SEO grind so you can focus on installs and customer calls.
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-all shadow-lg">
              Start free 14-day trial <ChevronRight className="w-4 h-4" />
            </Link>
            <p className="mt-3 text-[11px] text-zinc-700">No credit card required</p>
          </div>
        </section>

        {/* Other articles */}
        {others.length > 0 && (
          <section className="mt-16 pt-10 border-t border-white/[0.06]">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-5">More resources</p>
            <div className="space-y-3">
              {others.map((a) => (
                <Link
                  key={a.slug}
                  href={`/resources/${a.slug}`}
                  className="block rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/[0.14] hover:bg-white/[0.04] transition-all group"
                >
                  <p className="text-[10px] font-medium text-amber-400 uppercase tracking-widest mb-1">{a.category}</p>
                  <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-amber-300 transition-colors mb-1">{a.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{a.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
