import { Bug, Lightbulb, type LucideIcon } from 'lucide-react';
import { QuestionFormat } from '@/types';

export interface HintConfig {
  label: string;
  icon: LucideIcon;
  progressive: boolean;
  emptyMessage: string;
}

/** Format-specific hint configuration — label/icon/reveal-behavior per question format. */
export function getHintConfig(qf: QuestionFormat): HintConfig {
  switch (qf) {
    case QuestionFormat.OUTPUT_PREDICTION:
      return { label: 'Think About', icon: Lightbulb, progressive: true, emptyMessage: 'No thinking prompts available.' };
    case QuestionFormat.DEBUGGING:
      return { label: 'Where to Look', icon: Bug, progressive: true, emptyMessage: 'No debugging hints available.' };
    case QuestionFormat.CODE_WRITING:
      return { label: 'Follow-ups', icon: Lightbulb, progressive: false, emptyMessage: 'No follow-up questions available.' };
    case QuestionFormat.THEORY:
      return { label: 'Key Concepts', icon: Lightbulb, progressive: false, emptyMessage: 'No key concepts available.' };
    default:
      return { label: 'Hints', icon: Lightbulb, progressive: true, emptyMessage: 'No hints available for this question.' };
  }
}
