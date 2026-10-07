import React, { useState, useMemo } from "react";
import { Finding } from "@/types/contract";
import { Search, ArrowUpRight, ShieldAlert, HelpCircle } from "lucide-react";
import { sounds } from "@/lib/sounds";

interface FindingsListProps {
  findings: Finding[];
  onSelectFinding: (finding: Finding) => void;
  onOpenGuide?: () => void;
}

export const FindingsList: React.FC<FindingsListProps> = ({ findings, onSelectFinding, onOpenGuide }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return findings.filter((f) => {
      const matchesSearch =
        !term ||
        f.title.toLowerCase().includes(term) ||
        f.category.toLowerCase().includes(term) ||
        f.source_file.toLowerCase().includes(term);
      const matchesSeverity = severityFilter === "ALL" || f.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [findings, searchTerm, severityFilter]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-5 sm:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#293B54]">
        <div>
          <div className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider mb-1 flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]"></span>
            <span>DETECTION MATRIX</span>
          </div>
          <h2 className="text-xl font-semibold text-[#F3F6FA] tracking-tight font-mono">
            Security Vulnerability Findings
          </h2>
          <p className="text-xs text-[#CBD5E1] mt-0.5">
            Normalized findings correlated across AST, Slither static detectors, and Mythril symbolic traces.
          </p>
        </div>
        <div className="flex items-center space-x-3 self-start md:self-auto">
          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="flex items-center space-x-1.5 px-3 py-1.5 glass-panel hover:bg-[#17202E] text-[#F3F6FA] rounded-xl text-xs font-medium border border-[#1F2B3E] hover:border-[#00E5FF]/40 transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>How to use</span>
            </button>
          )}
          <div className="text-xs font-mono text-[#94A3B8] px-3 py-1.5 bg-[#0B0F17] border border-[#1F2B3E] rounded-xl">
            {filtered.length} of {findings.length} findings displayed
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search vulnerabilities, affected contracts, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 glass-panel rounded-xl text-xs text-[#F3F6FA] placeholder-[#94A3B8] focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/50 border border-[#293B54] transition-all"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={severityFilter}
            onChange={(e) => {
              sounds.playSubtleClick();
              setSeverityFilter(e.target.value);
            }}
            className="w-full sm:w-auto h-10 glass-panel px-4 text-xs text-[#F3F6FA] rounded-xl cursor-pointer focus:outline-none focus:border-[#00E5FF] border border-[#293B54] bg-[#111722]"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Severity</option>
            <option value="HIGH">High Severity</option>
            <option value="MEDIUM">Medium Severity</option>
            <option value="LOW">Low Severity</option>
            <option value="INFORMATIONAL">Informational</option>
          </select>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden shadow-sm border border-[#293B54]">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs min-w-[620px]">
          <thead>
            <tr className="bg-[#111722]/90 border-b border-[#1F2B3E] text-[#CBD5E1]">
              <th className="py-3 px-5 font-bold text-[11px] uppercase tracking-wider w-28">Severity</th>
              <th className="py-3 px-5 font-bold text-[11px] uppercase tracking-wider">Vulnerability Title</th>
              <th className="py-3 px-5 font-bold text-[11px] uppercase tracking-wider w-44">Source Target</th>
              <th className="py-3 px-5 font-bold text-[11px] uppercase tracking-wider w-28">Confidence</th>
              <th className="py-3 px-5 font-bold text-[11px] uppercase tracking-wider w-36">Detector</th>
              <th className="py-3 px-5 font-bold text-[11px] uppercase tracking-wider text-right w-24">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2B3E]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 px-6 text-center">
                  <div className="crystal-placeholder crystal-facet p-8 rounded-2xl max-w-sm mx-auto space-y-2.5">
                    <div className="w-10 h-10 rounded-xl crystal-panel flex items-center justify-center mx-auto text-[#00E5FF]">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-semibold text-[#F3F6FA]">No matching security findings</div>
                    <div className="text-[11px] text-[#CBD5E1]">Try adjusting your search keywords or severity level filters.</div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((f) => {
                const badge =
                  f.severity === "CRITICAL"
                    ? "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30"
                    : f.severity === "HIGH"
                    ? "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30"
                    : f.severity === "MEDIUM"
                    ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30"
                    : f.severity === "LOW"
                    ? "bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/30"
                    : "bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/30";

                return (
                  <tr
                    key={f.id}
                    onClick={() => {
                      sounds.playClick();
                      onSelectFinding(f);
                    }}
                    className="hover:bg-[#17202E]/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${badge}`}>
                        {f.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-medium text-[#F3F6FA]">
                      <div className="truncate max-w-md">{f.title}</div>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[#CBD5E1]">
                      <div className="truncate max-w-[170px]">{f.source_file}:{f.line_number || "-"}</div>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[#CBD5E1] font-semibold">
                      {f.confidence}
                    </td>
                    <td className="py-3.5 px-5 text-[#CBD5E1]">
                      <div className="truncate max-w-[130px]">{f.detector}</div>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span className="inline-flex items-center text-[11px] text-[#00E5FF] hover:underline font-mono">
                        Review <ArrowUpRight className="w-3.5 h-3.5 ml-1 text-[#00E5FF]" />
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};
