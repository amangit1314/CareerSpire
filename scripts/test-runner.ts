import { runTests, TestResult } from '../lib/code-runner';
import { QuestionType, Difficulty } from '../types/enums';
import { Question } from '../types';
import fs from 'node:fs';
import path from 'node:path';

async function logToFile(content: string) {
    const resultsDir = path.join(process.cwd(), 'tests-results');
    if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir);
    const logFile = path.join(resultsDir, `execution_report_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`);
    fs.appendFileSync(logFile, content + '\n');
    return logFile;
}

function formatResult(lang: string, res: TestResult): string {
    let output = `\n======================================================\n`;
    output += `LANGUAGE: ${lang.toUpperCase()}\n`;
    output += `VERDICT: ${res.verdict}\n`;
    output += `PASSED: ${res.passed}/${res.total}\n`;
    output += `------------------------------------------------------\n`;

    res.details.forEach((d, i) => {
        output += `TEST CASE #${i + 1}\n`;
        output += `[INPUT]    : ${JSON.stringify(d.input)}\n`;
        output += `[EXPECTED] : ${JSON.stringify(d.expected)}\n`;
        output += `[ACTUAL]   : ${JSON.stringify(d.actual)}\n`;
        if (d.error) output += `[ERROR]    : ${d.error}\n`;
        output += `[RESULT]   : ${d.passed ? 'PASS' : 'FAIL'}\n`;
        output += `------------------------------------------------------\n`;
    });

    return output;
}

async function testPipeline() {
    // 1. DSA - Two Sum (Numeric)
    const dsaSimple: Question = {
        id: 'dsa_1',
        title: 'Two Sum',
        testCases: [{ input: [5, 7], expectedOutput: 12 }],
        entryFunctionName: 'solve'
    } as any;

    // 2. DSA - Sort Array (Array Deep Equality)
    const dsaArray: Question = {
        id: 'dsa_2',
        title: 'Sort Array',
        testCases: [{ input: [[3, 1, 2]], expectedOutput: [1, 2, 3] }],
        entryFunctionName: 'sort'
    } as any;

    // 3. DSA - Matrix Transpose (Matrix Deep Equality)
    const dsaMatrix: Question = {
        id: 'dsa_3',
        title: 'Transpose',
        testCases: [{
            input: [[[1, 2], [3, 4]]],
            expectedOutput: [[1, 3], [2, 4]]
        }],
        entryFunctionName: 'transpose'
    } as any;

    // 4. Coding - String Normalization
    const codingString: Question = {
        id: 'coding_1',
        title: 'Clean String',
        testCases: [{ input: ["  Hello WORLD  "], expectedOutput: "hello world" }],
        entryFunctionName: 'clean'
    } as any;

    let report = `MOCKY FULL PLATFORM VERIFICATION REPORT\n`;
    report += `Timestamp: ${new Date().toLocaleString()}\n`;
    report += `======================================================\n`;

    const scenarios = [
        { name: 'JS DSA Simple', lang: 'javascript', question: dsaSimple, code: `function solve(a, b) { return a + b; }` },
        { name: 'JS DSA Array', lang: 'javascript', question: dsaArray, code: `function sort(a) { return a.sort((x, y) => x - y); }` },
        { name: 'JS DSA Matrix', lang: 'javascript', question: dsaMatrix, code: `function transpose(m) { return m[0].map((_, i) => m.map(row => row[i])); }` },

        { name: 'Py DSA Simple', lang: 'python', question: dsaSimple, code: `def solve(a, b): return a + b` },
        { name: 'Py DSA Array', lang: 'python', question: dsaArray, code: `def sort(a): return sorted(a)` },
        { name: 'Py DSA Matrix', lang: 'python', question: dsaMatrix, code: `def transpose(m): return [list(x) for x in zip(*m)]` },

        { name: 'Java DSA Simple', lang: 'java', question: dsaSimple, code: `public class Solution { public int solve(int a, int b) { return a + b; } }` },

        { name: 'Coding String JS', lang: 'javascript', question: codingString, code: `function clean(s) { return s.trim().toLowerCase(); }` },
        { name: 'Coding String Py', lang: 'python', question: codingString, code: `def clean(s): return s.strip().lower()` },
    ];

    for (const s of scenarios) {
        console.log(`Executing Scenario: ${s.name}...`);
        try {
            const res = await runTests(s.code, s.question, s.lang as any);
            report += formatResult(s.name, res);
        } catch (err: any) {
            report += `\nSCENARIO: ${s.name} - CRITICAL FAILURE: ${err.message}\n`;
        }
    }

    const finalLog = await logToFile(report);
    console.log(`\nVerification complete! Full report saved to: ${finalLog}`);
}

testPipeline().catch(console.error);
