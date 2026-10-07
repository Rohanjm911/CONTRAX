import React, { useRef, useEffect } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { Finding, SourceFile } from "@/types/contract";
import { FileCode, Lock, ChevronRight, HelpCircle } from "lucide-react";

interface MonacoSourceViewerProps {
  files: SourceFile[];
  selectedFile: string;
  onSelectFile: (path: string) => void;
  targetLine?: number;
  findings: Finding[];
  onOpenGuide?: () => void;
}

export const MonacoSourceViewer: React.FC<MonacoSourceViewerProps> = ({
  files,
  selectedFile,
  onSelectFile,
  targetLine,
  findings,
  onOpenGuide,
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const currentFileContent = files.find((f) => f.file_path === selectedFile)?.content || "// No Solidity file loaded";

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    updateFindingMarkers(editor, monaco);
  };

  const updateFindingMarkers = (editor: any, monaco: Monaco) => {
    if (!editor || !monaco) return;

    const fileFindings = findings.filter((f) => f.source_file === selectedFile && f.line_number);
    const markers = fileFindings.map((f) => ({
      startLineNumber: f.line_number!,
      startColumn: 1,
      endLineNumber: f.line_number!,
      endColumn: 100,
      message: `[${f.severity}] ${f.title}`,
      severity:
        f.severity === "CRITICAL" || f.severity === "HIGH"
          ? monaco.MarkerSeverity.Error
          : monaco.MarkerSeverity.Warning,
    }));

    const model = editor.getModel();
    if (model) {
      monaco.editor.setModelMarkers(model, "contrax-security", markers);
    }
  };

  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      updateFindingMarkers(editorRef.current, monacoRef.current);
    }
  }, [selectedFile, findings]);

  useEffect(() => {
    if (editorRef.current && targetLine) {
      editorRef.current.revealLineInCenter(targetLine);
      editorRef.current.setPosition({ lineNumber: targetLine, column: 1 });
    }
  }, [targetLine]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="h-10 bg-[#0E0E18] border-b border-[#201F38] px-3 sm:px-4 flex items-center justify-between text-xs select-none">
        <div className="flex items-center space-x-2 text-[#94A3B8] font-mono text-[11px] min-w-0">
          <FileCode className="w-3.5 h-3.5 text-[#C084FC] shrink-0" />
          
          <div className="sm:hidden">
            <select
              value={selectedFile}
              onChange={(e) => onSelectFile(e.target.value)}
              className="bg-[#08070E] border border-[#201F38] text-[#F3F6FA] text-[11px] rounded-lg px-2 py-0.5 max-w-[130px] truncate focus:outline-none"
            >
              {files.map((f) => (
                <option key={f.file_path} value={f.file_path}>
                  {f.file_path}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 truncate">
            <span className="text-[#CBD5E1]">contracts</span>
            <ChevronRight className="w-3 h-3 text-[#94A3B8]" />
            <span className="text-[#F3F6FA] font-bold truncate">{selectedFile}</span>
          </div>

          {targetLine && (
            <span className="text-[#C084FC] font-mono font-bold text-[10px] shrink-0">
              L{targetLine}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 text-[10px] font-mono text-[#CBD5E1] shrink-0">
          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="flex items-center space-x-1 px-2.5 py-1 glass-panel hover:bg-[#151426] text-[#F3F6FA] rounded-md border border-[#201F38] hover:border-[#A855F7]/40 transition-all font-semibold cursor-pointer"
              title="How to Use Monaco Source Viewer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#A855F7]" />
              <span className="font-sans text-[11px]">Guide</span>
            </button>
          )}
          <span className="hidden sm:flex items-center space-x-1 px-2.5 py-1 bg-[#08070E] rounded-md border border-[#201F38] text-[#CBD5E1] font-semibold">
            <Lock className="w-3 h-3 text-[#C084FC]" />
            <span>READ ONLY</span>
          </span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden sm:flex w-60 bg-[#08070E] border-r border-[#201F38] p-3 flex-col shrink-0">
          <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 px-2 font-mono">
            Target Sources ({files.length})
          </div>
          <div className="space-y-1 overflow-y-auto flex-1">
            {files.map((file) => {
              const isSelected = file.file_path === selectedFile;
              return (
                <button
                  key={file.file_path}
                  onClick={() => onSelectFile(file.file_path)}
                  className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition-all ${
                    isSelected
                      ? "bg-[#151426] text-[#FFFFFF] font-bold border border-[#A855F7]/40 shadow-sm"
                      : "text-[#CBD5E1] hover:bg-[#0E0E18] hover:text-[#F3F6FA] border border-transparent"
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#C084FC]" : "text-[#94A3B8]"}`} />
                  <span className="truncate">{file.file_path}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 bg-[#09090F]">
          <Editor
            height="100%"
            language="sol"
            theme="vs-dark"
            value={currentFileContent}
            options={{
              readOnly: true,
              minimap: { enabled: true },
              fontSize: 13.5,
              lineHeight: 22,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              fontFamily: "'Cascadia Code', Consolas, 'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, Monaco, monospace",
              fontLigatures: true,
              renderLineHighlight: "all",
              smoothScrolling: true,
              cursorSmoothCaretAnimation: "on",
            }}
            onMount={handleEditorDidMount}
          />
        </div>

        <div className="w-72 bg-[#0E0E18] border-l border-[#201F38] p-4 flex flex-col">
          <div className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-3 flex items-center justify-between font-mono">
            <span>File Annotations</span>
            <span className="font-mono text-[#F3F6FA] px-1.5 py-0.2 rounded bg-[#08070E] border border-[#201F38]">
              {findings.filter((f) => f.source_file === selectedFile).length}
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto flex-1">
            {findings.filter((f) => f.source_file === selectedFile).length === 0 ? (
              <div className="text-center py-8 text-xs text-[#CBD5E1]">
                No security flags on this source file.
              </div>
            ) : (
              findings
                .filter((f) => f.source_file === selectedFile)
                .map((f) => (
                  <div
                    key={f.id}
                    onClick={() => {
                      if (f.line_number && editorRef.current) {
                        editorRef.current.revealLineInCenter(f.line_number);
                        editorRef.current.setPosition({ lineNumber: f.line_number, column: 1 });
                      }
                    }}
                    className="p-3 bg-[#08070E] border border-[#201F38] hover:border-[#A855F7]/60 rounded-xl cursor-pointer transition-all text-xs"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className={`font-bold ${
                        f.severity === "CRITICAL" ? "text-[#EF4444]" : f.severity === "HIGH" ? "text-[#F97316]" : f.severity === "MEDIUM" ? "text-[#F59E0B]" : "text-[#C084FC]"
                      }`}>
                        {f.severity}
                      </span>
                      <span className="text-[#CBD5E1]">Line {f.line_number || "-"}</span>
                    </div>
                    <div className="font-semibold text-[#F3F6FA] mt-1 line-clamp-1">{f.title}</div>
                    <div className="text-[11px] text-[#94A3B8] mt-0.5 line-clamp-2">{f.description}</div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
