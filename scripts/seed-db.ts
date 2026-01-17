import { PrismaClient } from '@prisma/client';
import questions from './seed-questions.json' assert { type: 'json' };

const prisma = new PrismaClient();

async function seedQuestions() {
  console.log('Seeding questions via Prisma...');

  try {
    for (const question of questions) {
      const data = {
        title: question.title,
        description: question.description,
        topic: question.topic,
        difficulty: question.difficulty.toUpperCase() as any,
        type: question.type.toUpperCase() as any,
        language: question.language ? question.language.toUpperCase() as any : null,
        testCases: question.testCases,
        expectedComplexity: question.expectedComplexity,
        hints: question.hints,
      };

      const existing = await prisma.question.findFirst({
        where: { title: question.title }
      });

      if (!existing) {
        await prisma.question.create({ data });
        console.log(`✓ Created: ${question.title}`);
      } else {
        await prisma.question.update({
          where: { id: existing.id },
          data
        });
        console.log(`✓ Updated: ${question.title}`);
      }
    }

    console.log('Seeding complete!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedQuestions();
