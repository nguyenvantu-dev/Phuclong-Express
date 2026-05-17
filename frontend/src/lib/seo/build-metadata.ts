import type { Metadata } from 'next';
import {
  DEFAULT_LOCALE,
  DEFAULT_OG_IMAGE,
  LANGUAGE_ALTERNATES,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  TWITTER_HANDLE,
} from './site-config';

interface BuildMetadataInput {
  /** Page-specific title. Will be merged with title template -> "Title | Phuc Long Express". */
  title?: string;
  /** Bypass title template — render exactly as given (use for home page). */
  absoluteTitle?: string;
  /** Page-specific description; falls back to site default. */
  description?: string;
  /** Path beginning with "/". Used for canonical URL and OG URL. */
  path?: string;
  /** Page-specific keywords appended to global set. */
  keywords?: string[];
  /** Override OG image. Provide absolute URL. */
  ogImage?: { url: string; width?: number; height?: number; alt?: string };
  /** Set true for private/auth-gated pages. */
  noindex?: boolean;
}

/**
 * Build a Next.js `Metadata` object with consistent OG/Twitter/canonical/hreflang.
 * Use from server components (page.tsx without 'use client' or layout.tsx).
 */
export function buildMetadata(input: BuildMetadataInput = {}): Metadata {
  const {
    title,
    absoluteTitle,
    description = SITE_DESCRIPTION,
    path = '/',
    keywords,
    ogImage = DEFAULT_OG_IMAGE,
    noindex = false,
  } = input;

  // Next applies the root `title.template` only to plain string titles, not
  // to `{ absolute: ... }`. Use absoluteTitle to skip template wrapping.
  const titleField: Metadata['title'] | undefined = absoluteTitle
    ? { absolute: absoluteTitle }
    : title;
  const ogTitle = absoluteTitle ?? title ?? SITE_NAME;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const canonical = `${SITE_URL}${normalizedPath === '/' ? '' : normalizedPath}`;

  const robots: Metadata['robots'] = noindex
    ? { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } }
    : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
          'max-video-preview': -1,
        },
      };

  return {
    title: titleField,
    description,
    keywords,
    alternates: {
      canonical,
      languages: noindex ? undefined : LANGUAGE_ALTERNATES,
    },
    robots,
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: ogTitle,
      description,
      url: canonical,
      locale: DEFAULT_LOCALE,
      images: [
        {
          url: ogImage.url,
          width: ogImage.width ?? 1200,
          height: ogImage.height ?? 630,
          alt: ogImage.alt ?? ogTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title: ogTitle,
      description,
      images: [ogImage.url],
    },
  };
}
