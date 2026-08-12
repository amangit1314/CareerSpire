import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { status: 'ok', db: 'ok', timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (error) {
    console.error('[health] DB check failed:', error);
    return NextResponse.json(
      { status: 'error', db: 'error', timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
