import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Simple query to wake up the DB
        const count = await prisma.user.count({ take: 1 });
        console.log(`Cron Keep-Alive: DB is active. Users count check: ${count}`);

        return NextResponse.json({
            status: 'ok',
            message: 'Database is active',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Cron Keep-Alive Error:', error);
        return NextResponse.json(
            { error: 'Database check failed', details: error.message },
            { status: 500 }
        );
    }
}
