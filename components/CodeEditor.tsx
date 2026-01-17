'use client';

import { Editor } from '@monaco-editor/react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Play, Loader2 } from 'lucide-react';

interface CodeEditorProps {
  language?: 'javascript' | 'python';
  value: string;
  onChange: (value: string | undefined) => void;
  onRun?: () => void;
  isRunning?: boolean;
  height?: string;
}

export function CodeEditor({
  language = 'javascript',
  value,
  onChange,
  onRun,
  isRunning = false,
  height = '500px',
}: CodeEditorProps) {
  return (
    <div className="relative border rounded-lg overflow-hidden bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b">
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
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Code
              </>
            )}
          </Button>
        )}
      </div>
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  );
}
