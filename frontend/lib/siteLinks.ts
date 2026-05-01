/**
 * Novarite external link configuration.
 * Fill in URLs here — components read from this file, so you only need to
 * update one place. Leave a string empty ("") to hide the link from the UI.
 */
export const SITE_LINKS = {
  x:        "https://x.com/novarite85582",
  github:   "https://github.com/GiorgiGoishvili/Novarite",
  linkedin: "https://www.linkedin.com/in/giorgi-goishvili-4708a0347/?skipRedirect=true",
  discord:  "",
  about:    "/about",
} as const;

export type SiteLinks = typeof SITE_LINKS;
