import type { Metadata } from "next";
import { translations } from "./translations";
import { getCategory, getTool } from "./tools-data";

const zh = translations.zh as Record<string, string>;
const en = translations.en as Record<string, string>;

function getText(key: string): string {
  return zh[key] || key;
}

const SITE_NAME = "Tooltip.cc";

export function getCategoryMetadata(slug: string): Metadata {
  const cat = getCategory(slug);
  if (!cat) return {};
  const name = getText(cat.nameKey);
  const desc = getText(cat.descriptionKey);
  const intro = getText(cat.introKey);
  const description = intro.length > 150 ? intro.slice(0, 150) + "…" : intro || desc;
  return {
    title: `${name} - 免费在线工具`,
    description,
    openGraph: {
      title: `${name} - ${SITE_NAME}`,
      description,
      url: `https://tooltip.cc/${cat.slug}`,
      siteName: SITE_NAME,
      locale: "zh_CN",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${name} - ${SITE_NAME}`,
      description,
    },
  };
}

export function getToolMetadata(categorySlug: string, toolSlug: string): Metadata {
  const tool = getTool(categorySlug, toolSlug);
  if (!tool) return {};
  const name = getText(tool.nameKey);
  const desc = getText(tool.descriptionKey);
  const keywords = tool.keywords;
  const description = desc.length < 50 ? `${desc}。在线使用，免费快捷，浏览器本地运行，无需注册。` : desc;
  return {
    title: `${name} - 在线工具`,
    description,
    keywords,
    openGraph: {
      title: `${name} - ${SITE_NAME}`,
      description,
      url: `https://tooltip.cc/${tool.category}/${tool.slug}`,
      siteName: SITE_NAME,
      locale: "zh_CN",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${name} - ${SITE_NAME}`,
      description,
    },
  };
}
