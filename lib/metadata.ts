import type { Metadata } from "next";
import { translations } from "./translations";
import { getCategory, getTool } from "./tools-data";

type Lang = "zh" | "en";
const zh = translations.zh as Record<string, string>;
const en = translations.en as Record<string, string>;

function getText(key: string, lang: Lang = "zh"): string {
  return (lang === "en" ? en : zh)[key] || key;
}

const SITE_NAME = "Tooltip.cc";
const OG_IMAGE = "https://tooltip.cc/og-image.png";
const SITE_DESC_SUFFIX = "在线使用，免费快捷，浏览器本地运行，无需注册，保护隐私。";

function buildDescription(name: string, desc: string, keywords: string | undefined, lang: Lang): string {
  if (lang === "en") {
    // 英文版：不加中文后缀，保持简洁
    const full = desc || name;
    return full.length > 180 ? full.slice(0, 177) + "…" : full;
  }
  // 关键词取前几个有意义的（过滤纯英文/符号）
  let kw = "";
  if (keywords) {
    const parts = keywords.split(",").filter((k) => /[\u4e00-\u9fa5]/.test(k)).slice(0, 4).join("、");
    if (parts) kw = `支持${parts}等功能。`;
  }
  const full = `${desc}。${kw}${SITE_DESC_SUFFIX}`;
  // 控制长度 80-200 字符
  return full.length > 200 ? full.slice(0, 197) + "…" : full;
}

function buildLangAlternates(path: string): Metadata["alternates"] {
  return {
    canonical: `https://tooltip.cc${path}`,
    languages: {
      "zh-CN": `https://tooltip.cc${path}`,
      en: `https://tooltip.cc${path}?lang=en`,
      "x-default": `https://tooltip.cc${path}`,
    },
  };
}

export function getCategoryMetadata(slug: string, lang: Lang = "zh"): Metadata {
  const cat = getCategory(slug);
  if (!cat) return {};
  const name = getText(cat.nameKey, lang);
  const desc = getText(cat.descriptionKey, lang);
  const intro = getText(cat.introKey, lang);
  const description = intro.length > 150 ? intro.slice(0, 150) + "…" : intro || desc;
  const locale = lang === "en" ? "en_US" : "zh_CN";
  const title =
    lang === "en"
      ? `${name} - Free Online Tools | ${SITE_NAME}`
      : `${name} - 免费在线工具 | ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: buildLangAlternates(`/${cat.slug}`),
    openGraph: {
      title,
      description,
      url: `https://tooltip.cc/${cat.slug}`,
      siteName: SITE_NAME,
      locale,
      type: "website",
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export function getToolMetadata(categorySlug: string, toolSlug: string, lang: Lang = "zh"): Metadata {
  const tool = getTool(categorySlug, toolSlug);
  if (!tool) return {};
  const name = getText(tool.nameKey, lang);
  const desc = getText(tool.descriptionKey, lang);
  const keywords = tool.keywords;
  const description = buildDescription(name, desc, keywords, lang);
  const locale = lang === "en" ? "en_US" : "zh_CN";
  // 分类名（如“开发者工具”），用于 Title 长尾词
  const cat = getCategory(categorySlug);
  const catName = cat ? getText(cat.nameKey, lang) : "";
  const title =
    lang === "en"
      ? `${name} - Free Online ${catName} | ${SITE_NAME}`
      : `${name} - 免费在线${catName} | ${SITE_NAME}`;
  return {
    title,
    description,
    keywords,
    alternates: buildLangAlternates(`/${tool.category}/${tool.slug}`),
    openGraph: {
      title,
      description,
      url: `https://tooltip.cc/${tool.category}/${tool.slug}`,
      siteName: SITE_NAME,
      locale,
      type: "website",
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
