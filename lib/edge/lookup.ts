import { getLinkBySlug } from "@/lib/redis/links";
import type { Link } from "@/types/link";

export async function lookupRedirect(slug: string): Promise<Link | null> {
  return getLinkBySlug(slug);
}