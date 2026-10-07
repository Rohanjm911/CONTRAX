import React from "react";
import { Download, FileJson, FileText, HelpCircle, Sparkles, ShieldCheck } from "lucide-react";
import { sounds } from "@/lib/sounds";

interface ReportsViewProps {
  currentScanId: string | null;
  onOpenGuide?: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ currentScanId, onOpenGuide }) => {
  const downloadReport = (type: "json" | "pdf") => {
    if (!currentScanId) return;
    sounds.playSuccessChime();
    const url =
      type === "pdf"
        ? `http://127.0.0.1:8000/api/v1/reports/scan/${currentScanId}/download-pdf`
        : `http://127.0.0.1:8000/api/v1/reports/scan/${currentScanId}`;
    window.open(url, "_blank");
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-5 sm:space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#293B54] gap-4">
        <div>
          <div className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider mb-1 flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]"></span>
            <span>COMPLIANCE & EXPORTS</span>
          </div>
          <h2 className="text-xl font-semibold text-[#F3F6FA] tracking-tight font-mono">
            Security Audit Reports
          </h2>
          <p className="text-xs text-[#CBD5E1] mt-0.5">
            Generate auditor-compliant documentation in minimalist dual-tone PDF and structured JSON payloads.
          </p>
        </div>
        {onOpenGuide && (
          <button
            onClick={() => {
              sounds.playClick();
              onOpenGuide();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 glass-panel hover:bg-[#17202E] text-[#F3F6FA] rounded-xl text-xs font-medium border border-[#293B54] hover:border-[#00E5FF]/40 transition-all self-start sm:self-auto"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>How to use</span>
          </button>
        )}
      </div>

      {!currentScanId ? (
        <div className="p-16 text-center crystal-placeholder crystal-facet rounded-2xl space-y-3 border border-[#293B54]">
          <div className="w-12 h-12 rounded-2xl crystal-panel flex items-center justify-center mx-auto text-[#00E5FF]">
            <Sparkles className="w-6 h-6 text-[#00E5FF]" />
          </div>
          <div className="text-sm font-semibold text-[#F3F6FA]">No active scan selected</div>
          <div className="text-xs text-[#CBD5E1] max-w-sm mx-auto">
            Execute a vulnerability scan from the Scanner tab to compile and export reports.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-6 crystal-card crystal-facet rounded-2xl flex flex-col justify-between transition-all border border-[#293B54] hover:border-[#00E5FF]/40">
            <div>
              <div className="w-11 h-11 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-xl flex items-center justify-center mb-4 text-[#00E5FF]">
                <FileText className="w-5 h-5 text-[#00E5FF]" />
              </div>
              <h3 className="text-sm font-semibold text-[#F3F6FA] tracking-tight font-mono">
                PDF Security Audit Document
              </h3>
              <p className="text-xs text-[#CBD5E1] mt-2 leading-relaxed">
                Minimalist solid executive report containing contract metadata, categorized vulnerability findings, source snippets, remediation steps, and auditor disclaimers.
              </p>
            </div>
            <button
              onClick={() => downloadReport("pdf")}
              className="btn-contrax-primary mt-6 w-full py-2.5 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer shadow-lg"
            >
              <Download className="w-4 h-4 text-[#0B0E14] stroke-[2.5]" />
              <span>Download PDF Audit</span>
            </button>
          </div>

          <div className="p-6 crystal-card crystal-facet rounded-2xl flex flex-col justify-between transition-all border border-[#293B54] hover:border-[#00E5FF]/40">
            <div>
              <div className="w-11 h-11 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl flex items-center justify-center mb-4 text-[#F59E0B]">
                <FileJson className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <h3 className="text-sm font-semibold text-[#F3F6FA] tracking-tight font-mono">
                Machine-Readable JSON Report
              </h3>
              <p className="text-xs text-[#CBD5E1] mt-2 leading-relaxed">
                Structured JSON schema payload suitable for DevSecOps pipelines, automated GitHub actions, finding correlation, and continuous smart-contract security testing.
              </p>
            </div>
            <button
              onClick={() => downloadReport("json")}
              className="mt-6 w-full py-2.5 neu-button text-[#F3F6FA] text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4 text-[#00E5FF]" />
              <span>Export JSON Report</span>
            </button>
          </div>
        </div>
      )}

      <div className="p-5 bg-[#0B0F17] border border-[#293B54] rounded-2xl text-[11px] text-[#CBD5E1] space-y-1.5 leading-relaxed">
        <div className="font-semibold text-[#F3F6FA] flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-[#00E5FF]" />
          <span>Automated Analysis Notice & Auditor Disclaimer:</span>
        </div>
        <div>
          Automated static and symbolic security analysis does not replace a comprehensive manual smart contract security audit performed by professional human researchers. Automated tools are designed to catch common static patterns and symbolic paths but cannot evaluate business logic intentions.
        </div>
      </div>
    </div>
  );
};
