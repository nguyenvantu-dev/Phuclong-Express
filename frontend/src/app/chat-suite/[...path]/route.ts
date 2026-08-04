import { NextRequest, NextResponse } from 'next/server';

const CHAT_SUITE_ORIGIN = process.env.CHAT_SUITE_ORIGIN || 'http://27.71.229.12';
const PROXY_TIMEOUT_MS = 8000;

// Hop-by-hop headers must not be forwarded in either direction (RFC 7230 §6.1).
const HOP_BY_HOP_HEADERS = ['connection', 'host', 'content-length', 'content-encoding', 'transfer-encoding'];

function stripHopByHopHeaders(headers: Headers) {
  for (const name of HOP_BY_HOP_HEADERS) headers.delete(name);
  return headers;
}

async function proxy(request: NextRequest, path: string[]) {
  const targetUrl = `${CHAT_SUITE_ORIGIN}/${path.join('/')}${request.nextUrl.search}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers: stripHopByHopHeaders(new Headers(request.headers)),
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer(),
      redirect: 'manual',
      signal: controller.signal,
    });

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: stripHopByHopHeaders(new Headers(upstream.headers)),
    });
  } catch {
    // chat-suite unreachable or too slow — fail fast instead of hanging the
    // whole request-handling process (the original blind rewrite had no
    // timeout, so an unresponsive chat-suite could stall every page).
    return NextResponse.json({ error: 'chat-suite unavailable' }, { status: 504 });
  } finally {
    clearTimeout(timeout);
  }
}

type RouteParams = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  return proxy(request, (await params).path);
}
export async function POST(request: NextRequest, { params }: RouteParams) {
  return proxy(request, (await params).path);
}
export async function PUT(request: NextRequest, { params }: RouteParams) {
  return proxy(request, (await params).path);
}
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return proxy(request, (await params).path);
}
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return proxy(request, (await params).path);
}
