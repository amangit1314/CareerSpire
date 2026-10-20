// Per-question state + reducer for the mock interview page. Split out of
// page.tsx to keep that file under the project's 500-line ceiling — this
// machinery is self-contained and doesn't need to live inline.

import type { MockResult } from "@/types";

// UI-local enums (not shared domain concepts, so not in src/types/enums.ts):
// tab identity for this page's Tabs component, and the code-vs-text editor
// mode toggle.
export enum QuestionTab {
  Description = "description",
  Hints = "hints",
  Feedback = "feedback",
}

export enum EditorType {
  Code = "code",
  Text = "text",
}

// Monaco's `language` prop and the submit payload both need lowercase ids
// ('javascript', not 'JAVASCRIPT') — the shared `ProgrammingLanguage` enum
// in src/types/enums.ts is uppercase and has no 'cpp' entry, so it doesn't
// fit this editor's needs. Kept local and explicit instead of forcing a
// mismatched shared enum.
export const SUPPORTED_EDITOR_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
] as const;

export const DEFAULT_EDITOR_LANGUAGE = SUPPORTED_EDITOR_LANGUAGES[0].value;

// The 8 fields below all reset together whenever the question index changes
// (previously 8 separate useState calls set in one effect — see the reset
// effect in page.tsx). Grouping them here makes that "reset together"
// invariant structural instead of implicit in call order. Session-level
// state (currentQuestionIndex, sessionTimeElapsed, timers, panel-collapse)
// stays as plain useState in page.tsx — it doesn't reset per question, so
// it doesn't belong in this reducer.
export interface QuestionState {
  code: string;
  selectedLanguage: string;
  editorType: EditorType;
  formattedSnippet: string;
  questionTimeSpent: number;
  submittedResult: MockResult | null;
  activeTab: QuestionTab;
  revealedHints: number;
}

export enum QuestionActionType {
  ResetForQuestion = "RESET_FOR_QUESTION",
  SetCode = "SET_CODE",
  SetLanguage = "SET_LANGUAGE",
  SetEditorType = "SET_EDITOR_TYPE",
  SetFormattedSnippet = "SET_FORMATTED_SNIPPET",
  TickQuestionTime = "TICK_QUESTION_TIME",
  SubmitResult = "SUBMIT_RESULT",
  SetActiveTab = "SET_ACTIVE_TAB",
  RevealNextHint = "REVEAL_NEXT_HINT",
}

export type QuestionAction =
  | {
      type: QuestionActionType.ResetForQuestion;
      language: string;
      editorType: EditorType;
      code: string;
      formattedSnippet: string;
    }
  | { type: QuestionActionType.SetCode; code: string }
  | { type: QuestionActionType.SetLanguage; language: string; code?: string }
  | { type: QuestionActionType.SetEditorType; editorType: EditorType }
  | { type: QuestionActionType.SetFormattedSnippet; snippet: string }
  | { type: QuestionActionType.TickQuestionTime }
  | { type: QuestionActionType.SubmitResult; result: MockResult }
  | { type: QuestionActionType.SetActiveTab; tab: QuestionTab }
  | { type: QuestionActionType.RevealNextHint };

export const initialQuestionState: QuestionState = {
  code: "",
  selectedLanguage: DEFAULT_EDITOR_LANGUAGE,
  editorType: EditorType.Code,
  formattedSnippet: "",
  questionTimeSpent: 0,
  submittedResult: null,
  activeTab: QuestionTab.Description,
  revealedHints: 0,
};

export function questionReducer(
  state: QuestionState,
  action: QuestionAction,
): QuestionState {
  switch (action.type) {
    case QuestionActionType.ResetForQuestion:
      return {
        code: action.code,
        selectedLanguage: action.language,
        editorType: action.editorType,
        formattedSnippet: action.formattedSnippet,
        questionTimeSpent: 0,
        submittedResult: null,
        activeTab: QuestionTab.Description,
        revealedHints: 0,
      };
    case QuestionActionType.SetCode:
      return { ...state, code: action.code };
    case QuestionActionType.SetLanguage:
      return {
        ...state,
        selectedLanguage: action.language,
        ...(action.code !== undefined ? { code: action.code } : {}),
      };
    case QuestionActionType.SetEditorType:
      return { ...state, editorType: action.editorType };
    case QuestionActionType.SetFormattedSnippet:
      return { ...state, formattedSnippet: action.snippet };
    case QuestionActionType.TickQuestionTime:
      return { ...state, questionTimeSpent: state.questionTimeSpent + 1 };
    case QuestionActionType.SubmitResult:
      return {
        ...state,
        submittedResult: action.result,
        activeTab: QuestionTab.Feedback,
      };
    case QuestionActionType.SetActiveTab:
      return { ...state, activeTab: action.tab };
    case QuestionActionType.RevealNextHint:
      return { ...state, revealedHints: state.revealedHints + 1 };
    default:
      return state;
  }
}
