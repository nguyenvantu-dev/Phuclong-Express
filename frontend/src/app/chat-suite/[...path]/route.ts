import { NextRequest, NextResponse } from 'next/server';

const CHAT_SUITE_ORIGIN = process.env.CHAT_SUITE_ORIGIN || 'http://27.71.229.12';
const PROXY_TIMEOUT_MS = 5000;
const MAX_BODY_BYTES = 5 * 1024 * 1024; // 5MB — request body is buffered in memory below
const MAX_CONCURRENT = 20; // cap in-flight proxied requests so a slow chat-suite can't starve the whole app
const CIRCUIT_FAILURE_THRESHOLD = 5; // consecutive failures before we stop even trying
const CIRCUIT_OPEN_MS = 30_000; // how long to short-circuit once tripped

// Headers that must never reach the external chat-suite host: hop-by-hop
// headers (RFC 7230 §6.1) plus our own site's auth — the browser attaches
// its accessToken cookie to every same-origin request, and forwarding it
// would leak the visitor's session to a third-party server over plain HTTP.
const STRIPPED_REQUEST_HEADERS = [
  'connection', 'host', 'content-length', 'content-encoding', 'transfer-encoding',
  'cookie', 'authorization',
];
const STRIPPED_RESPONSE_HEADERS = ['connection', 'content-length', 'content-encoding', 'transfer-encoding'];

function stripHeaders(headers: Headers, names: string[]) {
  for (const name of names) headers.delete(name);
  return headers;
}

let inFlight = 0;
let consecutiveFailures = 0;
let circuitOpenUntil = 0;

async function proxy(request: NextRequest, path: string[]) {
  if (Date.now() < circuitOpenUntil) {
    // chat-suite has failed repeatedly — stop hammering it and fail instantly
    // instead of tying up a connection for another PROXY_TIMEOUT_MS.
    return NextResponse.json({ error: 'chat-suite unavailable' }, { status: 503 });
  }

  if (inFlight >= MAX_CONCURRENT) {
    return NextResponse.json({ error: 'chat-suite busy' }, { status: 503 });
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) {
    // Reject before buffering into memory — an unbounded arrayBuffer() read
    // on a large upload (e.g. an image sent through the chat widget) can
    // spike Node's heap and crash the whole process, taking the entire
    // site down with it.
    return NextResponse.json({ error: 'payload too large' }, { status: 413 });
  }

  const targetUrl = `${CHAT_SUITE_ORIGIN}/${path.join('/')}${request.nextUrl.search}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

  inFlight++;
  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers: stripHeaders(new Headers(request.headers), STRIPPED_REQUEST_HEADERS),
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer(),
      redirect: 'manual',
      signal: controller.signal,
    });

    consecutiveFailures = 0;
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: stripHeaders(new Headers(upstream.headers), STRIPPED_RESPONSE_HEADERS),
    });
  } catch {
    // chat-suite unreachable or too slow — fail fast instead of hanging the
    // whole request-handling process (the original blind rewrite had no
    // timeout, so an unresponsive chat-suite could stall every page).
    consecutiveFailures++;
    if (consecutiveFailures >= CIRCUIT_FAILURE_THRESHOLD) {
      circuitOpenUntil = Date.now() + CIRCUIT_OPEN_MS;
    }
    return NextResponse.json({ error: 'chat-suite unavailable' }, { status: 504 });
  } finally {
    inFlight--;
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
