import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getToolMetadata } from "@/lib/metadata";
import { translations } from "@/lib/translations";
import { getTool, getCategory } from "@/lib/tools-data";
import { toolContent } from "@/lib/tool-content";
import ToolPageClient from "./tool-page-client";

export const runtime = 'edge';

interface Props {
  params: { category: string; tool: string };
  searchParams?: { lang?: string };
}

const zh = translations.zh as Record<string, string>;

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const lang = (searchParams?.lang === "en" ? "en" : "zh") as "zh" | "en";
  return getToolMetadata(params.category, params.tool, lang);
}

const en = translations.en as Record<string, string>;

function tKey(key: string, lang: string): string {
  const dict = lang === "en" ? en : zh;
  return dict[key] || key;
}

function buildFaqJsonLd(category: string, tool: string, lang: string): string | null {
  const t = getTool(category, tool);
  if (!t) return null;
  const name = tKey(t.nameKey, lang);
  const desc = tKey(t.descriptionKey, lang);
  const catKey = `cat.${category.replace('-tools', '')}`;
  const catName = tKey(catKey, lang) || category;
  const content = toolContent[tool];

  // 通用兜底问题
  const genericQuestions = lang === "en"
    ? [
        { q: `What is ${name}?`, a: `${name} is a free online tool provided by Tooltip.cc, ${desc}. No registration or installation needed.` },
        { q: `Is ${name} free?`, a: `Yes, completely free. All Tooltip.cc tools are free with no account required.` },
        { q: `Is my data safe?`, a: `Yes. ${name} runs entirely in your browser — data never leaves your device.` },
      ]
    : [
        { q: `${name}是什么？`, a: `${name}是 Tooltip.cc 提供的免费在线${catName}，${desc}。无需注册，打开浏览器即可使用。` },
        { q: `${name}收费吗？`, a: `完全免费。Tooltip.cc 所有工具均免费使用，无需注册账号。` },
        { q: `${name}安全吗？`, a: `安全。${name}完全在浏览器本地运行，数据不会上传到任何服务器。` },
      ];

  // 工具特有 FAQ 优先
  const questions = content?.faq
    ? content.faq.map(item => ({ q: item.q, a: item.a }))
    : genericQuestions;

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

function buildWebAppJsonLd(category: string, tool: string, lang: string): string | null {
  const t = getTool(category, tool);
  if (!t) return null;
  const name = tKey(t.nameKey, lang);
  const desc = tKey(t.descriptionKey, lang);
  const url = `https://tooltip.cc/${t.category}/${t.slug}`;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description: desc,
    url,
    inLanguage: lang === "en" ? "en" : "zh-CN",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    featureList: lang === "en"
      ? ["Free to use", "Runs locally in browser", "No registration", "No installation"]
      : ["免费使用", "浏览器本地运行", "无需注册", "无需安装"],
    publisher: {
      "@type": "Organization",
      name: "Tooltip.cc",
      url: "https://tooltip.cc/",
    },
  });
}

function buildBreadcrumbJsonLd(category: string, tool: string, lang: string): string | null {
  const cat = getCategory(category);
  const t = getTool(category, tool);
  if (!cat || !t) return null;
  const catName = tKey(cat.nameKey, lang);
  const toolName = tKey(t.nameKey, lang);
  const homeName = lang === "en" ? "Home" : "首页";
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: homeName, item: "https://tooltip.cc/" },
      { "@type": "ListItem", position: 2, name: catName, item: `https://tooltip.cc/${cat.slug}` },
      { "@type": "ListItem", position: 3, name: toolName, item: `https://tooltip.cc/${cat.slug}/${t.slug}` },
    ],
  });
}

function buildHowToJsonLd(category: string, tool: string, lang: string): string | null {
  const t = getTool(category, tool);
  if (!t) return null;
  const name = tKey(t.nameKey, lang);
  const content = toolContent[tool];

  const genericSteps = lang === "en"
    ? [
        "Open the tool below.",
        "Enter or upload the content you want to process.",
        "Click the action button to process your input.",
        "Copy the result or download the output file.",
      ]
    : [
        "打开下方工具。",
        "在输入框中输入或上传需要处理的内容。",
        "点击相应功能按钮执行操作。",
        "复制结果或下载输出文件。",
      ];

  const steps = content?.steps || genericSteps;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `${lang === "en" ? "How to Use" : "如何使用"} ${name}`,
    description: tKey(t.descriptionKey, lang),
    step: steps.map((text, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text,
    })),
  });
}

export default function ToolPage({ params, searchParams }: Props) {
  const lang = (searchParams?.lang === "en" ? "en" : "zh") as "zh" | "en";
  const faq = buildFaqJsonLd(params.category, params.tool, lang);
  const breadcrumb = buildBreadcrumbJsonLd(params.category, params.tool, lang);
  const webapp = buildWebAppJsonLd(params.category, params.tool, lang);
  const howto = buildHowToJsonLd(params.category, params.tool, lang);
  const path = `/${params.category}/${params.tool}`;
  return (
    <>
      {/* @ts-expect-error hreflang not typed */}
      <link rel="alternate" hreflang="zh-CN" href={`https://tooltip.cc${path}`} />
      {/* @ts-expect-error hreflang not typed */}
      <link rel="alternate" hreflang="en" href={`https://tooltip.cc${path}?lang=en`} />
      {/* @ts-expect-error hreflang not typed */}
      <link rel="alternate" hreflang="x-default" href={`https://tooltip.cc${path}`} />
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
      {howto && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: howto }}
        />
      )}
      <ToolPageClient category={params.category} tool={params.tool} />
    </>
  );
}
