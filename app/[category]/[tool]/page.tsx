import type { Metadata } from "next";
import { getToolMetadata } from "@/lib/metadata";
import { translations } from "@/lib/translations";
import { getTool } from "@/lib/tools-data";
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

export default function ToolPage({ params }: Props) {
  const faq = buildFaqJsonLd(params.category, params.tool);
  return (
    <>
      {faq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: faq }}
        />
      )}
      <ToolPageClient category={params.category} tool={params.tool} />
    </>
  );
}
