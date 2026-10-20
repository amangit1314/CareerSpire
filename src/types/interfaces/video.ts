// Video interview interfaces (src/app/actions/video.actions/). Part of the
// `interfaces/` split — see `interfaces/index.ts`.

import type {
  Difficulty,
  ProgrammingLanguage,
  Framework,
  InterviewMode,
  TechnicalFocus,
  NonTechnicalCategory,
  InterviewRoundType,
} from "../enums";

export interface VideoInterviewConfig {
  mode: InterviewMode;
  difficulty: Difficulty;
  // Technical options
  language?: ProgrammingLanguage;
  framework?: Framework;
  technicalFocus?: TechnicalFocus;
  // Non-technical options
  nonTechnicalCategory?: NonTechnicalCategory;
}

/** Round structure for the interview */
export interface InterviewRound {
  name: string;
  type: InterviewRoundType;
  count: number;
}
