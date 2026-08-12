import type { Metadata } from "next";
import { getCategoryMetadata } from "@/lib/metadata";
import { translations } from "@/lib/translations";
import { getCategory } from "@/lib/tools-data";
import CategoryPageClient from "./category-page-client";

export const runtime = 'edge';

interface Props {
  params: { category: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return getCategoryMetadata(params.category);
}

const zh = translations.zh as Record<string, string>;

function buildBreadcrumbJsonLd(slug: string): string | null {
  const cat = getCategory(slug);
  if (!cat) return null;
  const catName = zh[cat.nameKey] || cat.nameKey;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首页", item: "https://tooltip.cc/" },
      { "@type": "ListItem", position: 2, name: catName, item: `https://tooltip.cc/${cat.slug}` },
    ],
  });
}

export default function CategoryPage({ params }: Props) {
  const breadcrumb = buildBreadcrumbJsonLd(params.category);
  return (
    <>
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
