import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const sessions = await prisma.mockSession.findMany({
        orderBy: { startedAt: 'desc' },
        take: 5,
    });

    for (const session of sessions) {
        console.log(`Session ID: ${session.id}`);
        console.log(`Type: ${session.interviewType}`);
        console.log(`Question IDs: ${session.questionIds.length}`);

        const questions = await prisma.question.findMany({
            where: { id: { in: session.questionIds } }
        });
        console.log(`Questions in DB: ${questions.length}`);
        console.log('---');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
