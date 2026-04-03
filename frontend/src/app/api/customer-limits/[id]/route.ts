import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${API_URL}/api/customer-limits/${id}`);
  const data = await res.json();
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const username = request.headers.get('x-username') || 'system';

  const res = await fetch(`${API_URL}/api/customer-limits/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-username': username,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const username = request.headers.get('x-username') || 'system';

  const res = await fetch(`${API_URL}/api/customer-limits/${id}`, {
    method: 'DELETE',
    headers: {
      'x-username': username,
    },
  });
  const data = await res.json();
  return NextResponse.json(data);
}