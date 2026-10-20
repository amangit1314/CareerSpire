// Right-hand editor panel (language/mode toolbar + code or text editor +
// submit button) for the mock interview page. Split out of page.tsx to
// keep that file under the project's 500-line ceiling.

import { Send, Loader2, Code2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CodeEditor } from "@/components/CodeEditor";
import { QuestionFormat } from "@/types";
import {
  EditorType,
  QuestionActionType,
  SUPPORTED_EDITOR_LANGUAGES,
  type QuestionAction,
  type QuestionState,
} from "../questionReducer";
import { MOCK_INTERVIEW_CONTENT } from "@/config/content";

interface CodeEditorPanelProps {
  questionState: QuestionState;
  dispatch: React.Dispatch<QuestionAction>;
  qf: QuestionFormat;
  showLanguageSelector: boolean;
  isCodePanelCollapsed: boolean;
  onToggleCollapse: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function CodeEditorPanel({
  questionState,
  dispatch,
  qf,
  showLanguageSelector,
  isCodePanelCollapsed,
  onToggleCollapse,
  onSubmit,
  isSubmitting,
}: CodeEditorPanelProps) {
  return (
    <div
      className={
        "flex flex-col h-full bg-background transition-all duration-300 ease-in-out overflow-hidden " +
        (isCodePanelCollapsed ? "w-0" : "w-1/2")
      }
    >
      <div className="h-12 border-b flex items-center justify-between px-3 bg-muted/5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
            <Select
              value={questionState.editorType}
              onValueChange={(value: EditorType) =>
                dispatch({
                  type: QuestionActionType.SetEditorType,
                  editorType: value,
                })
              }
            >
              <SelectTrigger className="h-7 w-auto gap-1.5 text-xs font-semibold border border-border/50 bg-muted/30 hover:bg-muted/50 focus:ring-0 focus:ring-offset-0 px-2.5 rounded-md transition-colors">
                <SelectValue
                  placeholder={MOCK_INTERVIEW_CONTENT.MODE_PLACEHOLDER}
                />
              </SelectTrigger>
              <SelectContent align="start" className="min-w-[140px]">
                <SelectItem
                  value={EditorType.Code}
                  className="text-xs font-medium"
                >
                  {MOCK_INTERVIEW_CONTENT.CODE_EDITOR_OPTION}
                </SelectItem>
                <SelectItem
                  value={EditorType.Text}
                  className="text-xs font-medium"
                >
                  {MOCK_INTERVIEW_CONTENT.TEXT_EDITOR_OPTION}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {questionState.editorType === EditorType.Code &&
            showLanguageSelector && (
              <>
                <div className="h-4 w-px bg-border/50" />
                <Select
                  value={questionState.selectedLanguage}
                  onValueChange={(value) => {
                    const isPython = value === "python";
                    const oldComment =
                      questionState.selectedLanguage === "python"
                        ? "# Write your solution here\n"
                        : "// Write your solution here\n";
                    const newComment = isPython
                      ? "# Write your solution here\n"
                      : "// Write your solution here\n";
                    const shouldResetCode =
                      questionState.code === "" ||
                      questionState.code === oldComment;
                    dispatch({
                      type: QuestionActionType.SetLanguage,
                      language: value,
                      code: shouldResetCode ? newComment : undefined,
                    });
                  }}
                >
                  <SelectTrigger className="h-7 w-auto gap-1.5 text-xs font-bold uppercase border border-border/50 bg-muted/30 hover:bg-muted/50 focus:ring-0 focus:ring-offset-0 px-2.5 rounded-md transition-colors">
                    <SelectValue
                      placeholder={MOCK_INTERVIEW_CONTENT.LANGUAGE_PLACEHOLDER}
                    />
                  </SelectTrigger>
                  <SelectContent align="start" className="min-w-[140px]">
                    {SUPPORTED_EDITOR_LANGUAGES.map(({ value, label }) => (
                      <SelectItem
                        key={value}
                        value={value}
                        className="text-xs font-bold"
                      >
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={onToggleCollapse}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-hidden relative">
        {questionState.editorType === EditorType.Code ? (
          <div className="h-full p-4">
            <CodeEditor
              language={questionState.selectedLanguage}
              value={questionState.code}
              onChange={(value) =>
                dispatch({
                  type: QuestionActionType.SetCode,
                  code: value || "",
                })
              }
              height="100%"
              className="h-full shadow-sm"
            />
          </div>
        ) : (
          <div className="h-full p-4">
            <textarea
              value={questionState.code}
              onChange={(e) =>
                dispatch({
                  type: QuestionActionType.SetCode,
                  code: e.target.value,
                })
              }
              placeholder={
                qf === QuestionFormat.OUTPUT_PREDICTION
                  ? MOCK_INTERVIEW_CONTENT.ANSWER_PLACEHOLDER_OUTPUT_PREDICTION
                  : qf === QuestionFormat.THEORY
                    ? MOCK_INTERVIEW_CONTENT.ANSWER_PLACEHOLDER_THEORY
                    : MOCK_INTERVIEW_CONTENT.ANSWER_PLACEHOLDER_DEFAULT
              }
              className="w-full h-full p-6 text-base font-mono bg-muted/10 rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-primary/20 border-border border"
            />
          </div>
        )}

        {/* Bottom Actions Overlay */}
        <div className="absolute bottom-6 right-6 flex items-center gap-3">
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || !!questionState.submittedResult}
            className="shadow-2xl shadow-primary/20 px-4 py-2 h-12 rounded-full cursor-pointer h-full dark:text-white"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                {MOCK_INTERVIEW_CONTENT.SUBMITTING}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />{" "}
                {MOCK_INTERVIEW_CONTENT.SUBMIT_ANSWER}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
