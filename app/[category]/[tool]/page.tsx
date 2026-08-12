import type { Metadata } from "next";
import { getToolMetadata } from "@/lib/metadata";
import { translations } from "@/lib/translations";
import { getTool, getCategory } from "@/lib/tools-data";
import ToolPageClient from "./tool-page-client";

export const runtime = 'edge';

interface Props {
  params: { category: string; tool: string };
}

const zh = translations.zh as Record<string, string>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return getToolMetadata(params.category, params.tool);
}

function buildFaqJsonLd(category: string, tool: string): string | null {
  const t = getTool(category, tool);
  if (!t) return null;
  const name = zh[t.nameKey] || t.nameKey;
  const desc = zh[t.descriptionKey] || t.descriptionKey;
  const catName = zh[`cat.${category.replace('-tools', '')}`] || category;

  const questions = [
    {
      q: `${name}是什么？`,
      a: `${name}是 Tooltip.cc 提供的免费在线${catName}，${desc}。无需注册、无需安装，打开浏览器即可使用。`,
    },
    {
      q: `${name}收费吗？`,
      a: `完全免费。Tooltip.cc 的所有工具（包括${name}）均免费使用，无需注册账号。`,
    },
    {
      q: `${name}安全吗？数据会泄露吗？`,
      a: `安全。${name}完全在浏览器本地运行，数据不会上传到任何服务器，请放心使用。`,
    },
  ];

  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  });
}

function buildWebAppJsonLd(category: string, tool: string): string | null {
  const t = getTool(category, tool);
  if (!t) return null;
  const name = zh[t.nameKey] || t.nameKey;
  const desc = zh[t.descriptionKey] || t.descriptionKey;
  const url = `https://tooltip.cc/${t.category}/${t.slug}`;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description: desc,
    url,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    featureList: ["免费使用", "浏览器本地运行", "无需注册", "无需安装"],
    publisher: {
      "@type": "Organization",
      name: "Tooltip.cc",
      url: "https://tooltip.cc/",
    },
  });
}

function buildBreadcrumbJsonLd(category: string, tool: string): string | null {
  const cat = getCategory(category);
  const t = getTool(category, tool);
  if (!cat || !t) return null;
  const catName = zh[cat.nameKey] || cat.nameKey;
  const toolName = zh[t.nameKey] || t.nameKey;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首页", item: "https://tooltip.cc/" },
      { "@type": "ListItem", position: 2, name: catName, item: `https://tooltip.cc/${cat.slug}` },
      { "@type": "ListItem", position: 3, name: toolName, item: `https://tooltip.cc/${cat.slug}/${t.slug}` },
    ],
  });
}

export default function ToolPage({ params }: Props) {
  const faq = buildFaqJsonLd(params.category, params.tool);
  const breadcrumb = buildBreadcrumbJsonLd(params.category, params.tool);
  const webapp = buildWebAppJsonLd(params.category, params.tool);
  return (
    <>
      {faq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: faq }}
        />
      )}
      {breadcrumb && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: breadcrumb }}
        />
      )}
      {webapp && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: webapp }}
        />
      )}
      <ToolPageClient category={params.category} tool={params.tool} />
    </>
  );
}
