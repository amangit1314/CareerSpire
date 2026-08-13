export interface TestResult {
  passed: number;
  total: number;
  verdict: 'AC' | 'WA' | 'TLE' | 'RE' | 'CE' | 'UNKNOWN';
  details: Array<{
    input: unknown;
    expected: unknown;
    actual: unknown;
    passed: boolean;
    error?: string;
    stdout?: string;
  }>;
}

export const TIME_LIMIT_MS = 3000;
export const MEMORY_LIMIT_MB = 256;
