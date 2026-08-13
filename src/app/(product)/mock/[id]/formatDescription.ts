import { QuestionFormat } from '@/types';

// Strip sections from description based on question format
export const filterDescriptionByFormat = (text: string, format: QuestionFormat): string => {
  if (!text) return '';

  // Protect fenced code blocks from section removal
  const codeBlocks: string[] = [];
  let filtered = text.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return `__CB_${codeBlocks.length - 1}__`;
  });

  // Helper: remove from Examples heading to Constraints heading (or end of text)
  const stripExamples = (t: string) => t
    .replace(/(?:^|\n)(?:#+\s*)?Examples?[\s\S]*?(?=\n(?:#+\s*)?Constraints?:)/gim, '\n')
    .replace(/(?:^|\n)(?:#+\s*)?Examples?[\s\S]*/gim, '\n'); // fallback if no Constraints follows
  const stripConstraints = (t: string) => t
    .replace(/(?:^|\n)(?:#+\s*)?Constraints?:[\s\S]*/gim, '\n');

  switch (format) {
    case QuestionFormat.OUTPUT_PREDICTION:
      // Remove Examples (they contain the answer) and Constraints (irrelevant)
      filtered = stripConstraints(stripExamples(filtered));
      break;

    case QuestionFormat.DEBUGGING:
      // Remove Examples (correct I/O hints at the bug), keep Constraints
      filtered = stripExamples(filtered);
      break;

    case QuestionFormat.CODE_WRITING:
      // Remove rigid I/O examples, keep Constraints/Requirements
      filtered = stripExamples(filtered);
      break;

    case QuestionFormat.THEORY:
      // Remove Examples and Constraints
      filtered = stripConstraints(stripExamples(filtered));
      break;

    // DSA and MCQ: keep everything (LeetCode-style)
    default:
      break;
  }

  // Restore code blocks
  filtered = filtered.replace(/__CB_(\d+)__/g, (_, idx) => codeBlocks[Number(idx)]);

  return filtered;
};

// Format markdown headings and labels for display
export const formatDescription = (text: string) => {
  if (!text) return '';

  // Protect code blocks and inline spans
  const preserved: string[] = [];
  let cleanText = text
    .replace(/```[\s\S]*?```/g, (match) => {
      preserved.push(match);
      return `\n\n__PRESERVED_${preserved.length - 1}__\n\n`;
    })
    .replace(/`[^`\n]+`/g, (match) => {
      preserved.push(match);
      return `__PRESERVED_${preserved.length - 1}__`;
    });

  cleanText = cleanText
    .replace(/\*\*\s*\*\*/g, '')
    .replace(/###\s*###/g, '###');

  cleanText = cleanText
    .replace(/(?:^|\n)(?:#+\s*)?(Examples)\s*(?:\n|$)/gi, '\n\n### $1\n\n')
    .replace(/(?:^|\n)(?:#+\s*)?(Example \d+:|Example:)/gi, '\n\n### $1')
    .replace(/(?:^|\n)-?\s*(?:\*\*|)?(Input:|Output:|Explanation:)(?:\*\*|)?/gi, '\n\n**$1**')
    .replace(/(?:^|\n)(?:#+\s*)?(Constraints:)/gi, '\n\n### $1')
    .replace(/\n{3,}/g, '\n\n');

  cleanText = cleanText.replace(/__PRESERVED_(\d+)__/g, (_, idx) => preserved[Number(idx)]);

  return cleanText.trim();
};
