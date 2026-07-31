import type { Metadata } from "next";
import { getCategoryMetadata } from "@/lib/metadata";
import CategoryPageClient from "./category-page-client";

export const runtime = 'edge';

interface Props {
  params: { category: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return getCategoryMetadata(params.category);
}

export default function CategoryPage({ params }: Props) {
  return <CategoryPageClient category={params.category} />;
}
