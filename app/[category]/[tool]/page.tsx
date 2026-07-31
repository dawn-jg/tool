import type { Metadata } from "next";
import { getToolMetadata } from "@/lib/metadata";
import ToolPageClient from "./tool-page-client";

export const runtime = 'edge';

interface Props {
  params: { category: string; tool: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return getToolMetadata(params.category, params.tool);
}

export default function ToolPage({ params }: Props) {
  return <ToolPageClient category={params.category} tool={params.tool} />;
}
