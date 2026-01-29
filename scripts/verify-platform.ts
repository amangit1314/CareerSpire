import { DynamicTestEngine } from '../lib/testing/engine';
import { prisma } from '../lib/prisma';
import { QuestionType } from '../types/enums';
import fs from 'node:fs';
import path from 'node:path';

async function runVerification() {
    console.log('🚀 INITIALIZING PLATFORM DYNAMIC VERIFICATION...');

    // 1. Setup Test User
    const testUserId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'; // Static valid UUID for test
    // Cleanup previous test user if exists
    await prisma.user.deleteMany({ where: { id: testUserId } });
    await prisma.user.create({
        data: {
            id: testUserId,
            email: `${testUserId}@example.com`,
            name: 'Test Engine',
            level: 'INTERMEDIATE'
        }
    });

    const engine = new DynamicTestEngine(testUserId);
    const reports: string[] = [];

    reports.push(`PLATFORM INTEGRITY REPORT\nGenerated: ${new Date().toLocaleString()}\n`);
    reports.push(`======================================================\n`);

    // 2. Run DSA Test
    console.log('--- Testing DSA Workflow ---');
    const dsaResults = await engine.runFullInterviewSimulation(QuestionType.DSA);
    reports.push(`[DSA WORKFLOW]\n`);
    dsaResults.forEach(r => {
        reports.push(`${r.status === 'SUCCESS' ? '✅' : '❌'} ${r.step}: ${r.status}${r.error ? ` (Error: ${r.error})` : ''}\n`);
        if (r.details) reports.push(`   Details: ${JSON.stringify(r.details)}\n`);
    });
    reports.push(`\n------------------------------------------------------\n`);

    // 3. Cleanup
    console.log('Cleaning up test data...');
    // We'll leave the user for debugging but could delete in production

    const resultsDir = path.join(process.cwd(), 'tests-results');
    const logFile = path.join(resultsDir, `platform_integrity_${Date.now()}.txt`);
    fs.writeFileSync(logFile, reports.join(''));

    console.log(`\n✅ Platform verification complete! Report: ${logFile}`);

    // Exit with status code based on failures
    const hasFailures = dsaResults.some(r => r.status === 'FAILURE');
    process.exit(hasFailures ? 1 : 0);
}

runVerification().catch(err => {
    console.error('CRITICAL ENGINE FAILURE:', err);
    process.exit(1);
});
