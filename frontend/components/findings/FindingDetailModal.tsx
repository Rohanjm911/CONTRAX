import React, { useEffect } from "react";
import { Finding } from "@/types/contract";
import { X, ExternalLink, Code2, Copy, Check } from "lucide-react";
import { sounds } from "@/lib/sounds";

interface FindingDetailModalProps {
  finding: Finding | null;
  onClose: () => void;
  onJumpToSource: (file: string, line?: number) => void;
}

export const FindingDetailModal: React.FC<FindingDetailModalProps> = ({
  finding,
  onClose,
  onJumpToSource,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (finding) {
      sounds.playBeep(920);
    }
  }, [finding]);

  if (!finding) return null;

  const handleCopy = () => {
    sounds.playSubtleClick();
    const text = `[${finding.severity}] ${finding.title}\nLocation: ${finding.source_file}:${finding.line_number}\nDetector: ${finding.detector}\n\nDescription:\n${finding.description}\n\nImpact:\n${finding.impact}\n\nRemediation:\n${finding.remediation}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const badge =
    finding.severity === "CRITICAL"
      ? "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30"
      : finding.severity === "HIGH"
      ? "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30"
      : finding.severity === "MEDIUM"
      ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30"
      : finding.severity === "LOW"
      ? "bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/30"
      : "bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/30";

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in duration-200">
      <div className="glass-panel-elevated rounded-2xl max-w-2xl w-full max-h-[94vh] sm:max-h-[88vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
        <div className="p-4 sm:p-6 border-b border-[#293B54] flex items-start justify-between bg-[#17202E]/40 backdrop-blur-md">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-md border ${badge}`}>
                {finding.severity}
              </span>
              <span className="text-[11px] font-mono text-[#94A3B8]">
                CONFIDENCE: {finding.confidence}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-[#F3F6FA] mt-2 tracking-tight font-mono">
              {finding.title}
            </h3>
            <div className="text-xs font-mono text-[#94A3B8] mt-0.5">
              {finding.source_file}:{finding.line_number || "global"}
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playSubtleClick();
              onClose();
            }}
            className="text-[#94A3B8] hover:text-[#F3F6FA] p-1.5 rounded-lg hover:bg-[#1E2B3D] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs">
          <div className="bg-[#0B0F17] border border-[#293B54] p-3 sm:p-4 rounded-xl space-y-1.5">
            <div className="font-semibold text-[#94A3B8] uppercase tracking-wider text-[10px]">
              Vulnerability Description
            </div>
            <div className="text-[#F3F6FA] leading-relaxed">
              {finding.description}
            </div>
          </div>

          <div className="bg-[#0B0F17] border border-[#293B54] p-3 sm:p-4 rounded-xl space-y-1.5">
            <div className="font-semibold text-[#94A3B8] uppercase tracking-wider text-[10px]">
              Security Impact
            </div>
            <div className="text-[#F3F6FA] leading-relaxed">
              {finding.impact}
            </div>
          </div>

          {finding.code_snippet && (
            <div className="bg-[#0B0F17] border border-[#293B54] p-3 sm:p-4 rounded-xl space-y-1.5">
              <div className="font-semibold text-[#94A3B8] uppercase tracking-wider text-[10px]">
                Affected Code Snippet (Line {finding.line_number})
              </div>
              <pre className="p-3 bg-[#111722] border border-[#293B54] rounded-lg font-mono text-[11px] text-[#F3F6FA] overflow-x-auto">
                {finding.code_snippet}
              </pre>
            </div>
          )}

          <div className="bg-[#0B0F17] border border-[#293B54] p-3 sm:p-4 rounded-xl space-y-1.5">
            <div className="font-semibold text-[#94A3B8] uppercase tracking-wider text-[10px]">
              Remediation Guidance
            </div>
            <div className="text-[#F3F6FA] leading-relaxed">
              {finding.remediation}
            </div>
          </div>

          {finding.references && finding.references.length > 0 && (
            <div className="bg-[#0B0F17] border border-[#293B54] p-3 sm:p-4 rounded-xl space-y-2">
              <div className="font-semibold text-[#94A3B8] uppercase tracking-wider text-[10px]">
                Security References & SWC Standard
              </div>
              <div className="space-y-1">
                {finding.references.map((ref, idx) => (
                  <a
                    key={idx}
                    href={ref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#C084FC] hover:underline flex items-center space-x-1 font-mono text-[11px] break-all"
                  >
                    <span>{ref}</span>
                    <ExternalLink className="w-3 h-3 inline text-[#C084FC] shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 sm:px-6 border-t border-[#201F38] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#151426]/70">
          <div className="text-[11px] font-mono text-[#CBD5E1] text-center sm:text-left">
            Detector: <span className="font-semibold text-[#C084FC]">{finding.detector}</span>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-initial justify-center px-3.5 py-2 bg-[#0E0E18] hover:bg-[#1A1830] text-[#CBD5E1] hover:text-[#F3F6FA] rounded-xl text-xs font-semibold border border-[#201F38] hover:border-[#A855F7]/40 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#C084FC]" /> : <Copy className="w-3.5 h-3.5 text-[#94A3B8]" />}
              <span>{copied ? "Copied" : "Copy Finding"}</span>
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
                onJumpToSource(finding.source_file, finding.line_number);
              }}
              className="btn-contrax-primary flex-1 sm:flex-initial justify-center px-4 py-2 rounded-xl text-xs font-extrabold text-[#FFFFFF] flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer shadow-lg"
            >
              <Code2 className="w-4 h-4 text-[#FFFFFF] stroke-[2.5]" />
              <span>Jump to Source</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
