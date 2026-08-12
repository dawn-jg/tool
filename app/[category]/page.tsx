import type { Metadata } from "next";
import { getCategoryMetadata } from "@/lib/metadata";
import { translations } from "@/lib/translations";
import { getCategory } from "@/lib/tools-data";
import CategoryPageClient from "./category-page-client";

export const runtime = 'edge';

interface Props {
  params: { category: string };
  searchParams?: { lang?: string };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const lang = (searchParams?.lang === "en" ? "en" : "zh") as "zh" | "en";
  return getCategoryMetadata(params.category, lang);
}

const zh = translations.zh as Record<string, string>;

function buildBreadcrumbJsonLd(slug: string, lang: string): string | null {
  const cat = getCategory(slug);
  if (!cat) return null;
  const dict: Record<string, string> = lang === "en" ? translations.en : zh;
  const catName = dict[cat.nameKey] || cat.nameKey;
  const homeName = lang === "en" ? "Home" : "首页";
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: homeName, item: "https://tooltip.cc/" },
      { "@type": "ListItem", position: 2, name: catName, item: `https://tooltip.cc/${cat.slug}` },
    ],
  });
}

export default function CategoryPage({ params, searchParams }: Props) {
  const lang = (searchParams?.lang === "en" ? "en" : "zh") as "zh" | "en";
  const breadcrumb = buildBreadcrumbJsonLd(params.category, lang);
  return (
    <>
      {/* @ts-expect-error hreflang not typed */}
      <link rel="alternate" hreflang="zh-CN" href={`https://tooltip.cc/${params.category}`} />
      {/* @ts-expect-error hreflang not typed */}
      <link rel="alternate" hreflang="en" href={`https://tooltip.cc/${params.category}?lang=en`} />
      {/* @ts-expect-error hreflang not typed */}
      <link rel="alternate" hreflang="x-default" href={`https://tooltip.cc/${params.category}`} />
      {breadcrumb && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: breadcrumb }}
        />
      )}
      <CategoryPageClient category={params.category} />
    </>
  );
}
