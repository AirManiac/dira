const PREFIX = "link-lab";

export const redisKeys = {
  link: (slug: string) => `${PREFIX}:link:${slug}`,

  links: () => `${PREFIX}:links`,

  click: (id: string) => `${PREFIX}:click:${id}`,

  clicks: () => `${PREFIX}:clicks`,
} as const;