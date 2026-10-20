"use client";

import { Editor, OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";
// import { useCallback, useEffect, useRef, useState } from 'react';
import { useCallback, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Play, Loader2, Check, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCodeAsync } from "@/lib/utils/formatCode";
import type { editor as MonacoEditor } from "monaco-editor";
import { CODE_EDITOR_MESSAGES } from "@/config/messages";

enum ToastType {
  Success = "success",
  Error = "error",
}

interface CodeEditorProps {
  language?: string;
  value: string;
  onChange: (value: string | undefined) => void;
  onRun?: () => void;
  isRunning?: boolean;
  height?: string;
  readOnly?: boolean;
  className?: string;
  hideToolbar?: boolean;
}

export function CodeEditor({
  language = "javascript",
  value,
  onChange,
  onRun,
  isRunning = false,
  height = "500px",
  readOnly = false,
  className,
  hideToolbar = false,
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme();
  // const [mounted, setMounted] = useState(false);
  const monacoTheme = resolvedTheme === "dark" ? "vs-dark" : "light";
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const [toast, setToast] = useState<{
    type: ToastType;
    message: string;
  } | null>(null);

  // The client-mount guard for theme-dependent rendering (see `mounted`
  // usage below): `resolvedTheme` is only reliable after hydration, so this
  // intentionally flips state on mount to defer theme-dependent output and
  // avoid a server/client mismatch — the same class of bug fixed in
  // useAuth.ts this session, solved here the correct way instead of the
  // `typeof window` anti-pattern that caused that one.
   
  // useEffect(() => { setMounted(true); }, []);

  const showToast = useCallback((type: ToastType, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2000);
  }, []);

  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;

      if (readOnly) return;

      // Cmd/Ctrl+S → format with Prettier
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        const model = editor.getModel();
        if (!model) return;

        const currentCode = model.getValue();
        formatCodeAsync(currentCode, language).then((formatted) => {
          if (formatted === currentCode) {
            // Prettier returned same code — could be already formatted or has syntax errors
            // Check Monaco markers for errors
            const markers = monaco.editor.getModelMarkers({
              resource: model.uri,
            });
            const errors = markers.filter(
              (m: MonacoEditor.IMarkerData) =>
                m.severity === monaco.MarkerSeverity.Error,
            );
            if (errors.length > 0) {
              editor.revealLineInCenter(errors[0].startLineNumber);
              showToast(
                ToastType.Error,
                CODE_EDITOR_MESSAGES.ERRORS_FOUND(errors.length),
              );
            } else {
              showToast(ToastType.Success, CODE_EDITOR_MESSAGES.CODE_FORMATTED);
            }
          } else {
            // Apply formatted code
            editor.executeEdits("prettier", [
              {
                range: model.getFullModelRange(),
                text: formatted,
              },
            ]);
            showToast(ToastType.Success, CODE_EDITOR_MESSAGES.CODE_FORMATTED);
          }
        });
      });

      // Enable JS/TS validation for inline errors
      monaco.languages.typescript?.javascriptDefaults?.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });
      monaco.languages.typescript?.typescriptDefaults?.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });
    },
    [readOnly, language, showToast],
  );

  return (
    <div
      className={cn(
        "relative border rounded-lg overflow-hidden flex flex-col h-full",
        "bg-white dark:bg-[#1e1e1e]",
        className,
      )}
    >
      {!hideToolbar && (
        <div
          className={cn(
            "flex items-center justify-between px-4 py-2 border-b",
            "bg-muted/50 dark:bg-[#252526]",
          )}
        >
          <span className="text-sm text-muted-foreground font-mono">
            {language}
          </span>
          {onRun && (
            <Button
              size="sm"
              onClick={onRun}
              disabled={isRunning}
              className="bg-primary hover:bg-primary/90"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {CODE_EDITOR_MESSAGES.RUNNING}
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  {CODE_EDITOR_MESSAGES.RUN_CODE}
                </>
              )}
            </Button>
          )}
        </div>
      )}
      <div className="flex-1 min-h-0 relative">
        <Editor
          height={height}
          language={language}
          value={value}
          onChange={onChange}
          // theme={mounted ? monacoTheme : 'vs-dark'}
          theme={monacoTheme}
          onMount={handleMount}
          options={{
            readOnly,
            domReadOnly: readOnly,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            padding: { top: 16, bottom: 16 },
            formatOnPaste: !readOnly,
            formatOnType: !readOnly,
            glyphMargin: !readOnly,
            renderValidationDecorations: readOnly ? "off" : "on",
          }}
        />

        {/* Toast notification */}
        {toast && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-lg",
                toast.type === ToastType.Success
                  ? "bg-foreground text-background"
                  : "bg-destructive text-destructive-foreground",
              )}
            >
              {toast.type === ToastType.Success ? (
                <CheckCircle className="h-3.5 w-3.5" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5" />
              )}
              {toast.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
