'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

const HIDDEN_PREFIXES = ['/admin', '/login'];

// Chatbot widget stays out of /admin/* — internal staff don't need it, and
// it would otherwise float over admin tables/forms — and off /login.
export default function ChatSuiteWidget() {
  const pathname = usePathname();
  if (pathname && HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;

  return (
    <Script
      src="/chat-suite/widget.js"
      data-site-id="phuc-long-express"
      data-api-base="/chat-suite"
      strategy="afterInteractive"
    />
  );
}
