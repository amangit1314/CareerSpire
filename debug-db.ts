import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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
