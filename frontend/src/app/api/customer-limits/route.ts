import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = searchParams.toString();

  const res = await fetch(`${API_URL}/api/customer-limits${params ? '?' + params : ''}`);
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const username = request.headers.get('x-username') || 'system';

  const res = await fetch(`${API_URL}/api/customer-limits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-username': username,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data);
}

