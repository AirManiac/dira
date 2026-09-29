import type { Link } from "@/types/link";

export function createRedirectResponse(link: Link): Response {
  return Response.redirect(link.destination, 302);
}