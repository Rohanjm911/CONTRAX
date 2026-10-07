import React, { useMemo } from "react";
import { Finding, ScanStatus } from "@/types/contract";
import { 
  ShieldAlert, 
  AlertTriangle, 
  AlertCircle, 
  ShieldCheck, 
  Plus, 
  ArrowUpRight, 
  Clock, 
  Terminal, 
  Network, 
  ChevronRight,
  HelpCircle
} from "lucide-react";
import { VulnerabilityDonutChart } from "@/components/charts/VulnerabilityDonutChart";
import { CategoryBarChart } from "@/components/charts/CategoryBarChart";
import { sounds } from "@/lib/sounds";

interface DashboardOverviewProps {
  scans: ScanStatus[];
  findings: Finding[];
  onOpenScanner: () => void;
  onSelectScan?: (scanId: string) => void;
  onSelectFinding?: (finding: Finding) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenGuide?: (tab?: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  scans, 
  findings, 
  onOpenScanner,
  onSelectScan,
  onSelectFinding,
  onNavigateTab,
  onOpenGuide
}) => {
  const { critical, high, medium, low, informational, securityScore, postureRating, topFindings } = useMemo(() => {
    let crit = 0, h = 0, m = 0, l = 0, info = 0;
    for (const f of findings) {
      if (f.severity === "CRITICAL") crit++;
      else if (f.severity === "HIGH") h++;
      else if (f.severity === "MEDIUM") m++;
      else if (f.severity === "LOW") l++;
      else info++;
    }

    const penalty = (crit * 25) + (h * 12) + (m * 5) + (l * 1);
    const score = Math.max(10, Math.min(100, 100 - penalty));

    const rating = 
      score >= 85 ? { label: "DEFENDED", color: "text-[#00E5FF]", bg: "bg-[#00E5FF]/10", border: "border-[#00E5FF]/30" } :
      score >= 60 ? { label: "MODERATE RISK", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", border: "border-[#F59E0B]/30" } :
      { label: "CRITICAL EXPOSURE", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", border: "border-[#EF4444]/30" };

    return {
      critical: crit,
      high: h,
      medium: m,
      low: l,
      informational: info,
      securityScore: score,
      postureRating: rating,
      topFindings: findings.slice(0, 4)
    };
  }, [findings]);

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 sm:pb-6 border-b border-[#1F2B3E] gap-4">
        <div>
          <div className="text-[10px] font-mono text-[#94A3B8] font-bold uppercase tracking-wider mb-1 flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]"></span>
            <span>CONTRAX • TACTICAL SECURITY OPERATIONS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F3F6FA] font-mono">
            Security Operations Console
          </h2>
          <p className="text-xs text-[#CBD5E1] mt-1 max-w-2xl leading-relaxed">
            Automated static AST parsing, Slither detectors, and Mythril symbolic execution across Solidity smart contracts.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          {onOpenGuide && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenGuide("dashboard");
              }}
              className="px-3.5 py-2 glass-panel hover:bg-[#17202E] text-[#F3F6FA] rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all border border-[#293B54] hover:border-[#00E5FF]/40 group"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#00E5FF] group-hover:rotate-12 transition-transform" />
              <span>How to use</span>
            </button>
          )}
          {onNavigateTab && (
            <button
              onClick={() => {
                sounds.playClick();
                onNavigateTab("graph");
              }}
              className="px-3.5 py-2 bg-[#111722]/80 hover:bg-[#17202E] text-[#F3F6FA] rounded-xl border border-[#293B54] hover:border-[#00E5FF]/40 text-xs font-semibold flex items-center space-x-2 transition-all"
            >
              <Network className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Contract Graph</span>
            </button>
          )}
          <button
            onClick={() => {
              sounds.playBeep(1100);
              onOpenScanner();
            }}
            className="btn-contrax-primary px-4 py-2 text-[#0B0E14] font-bold text-xs rounded-xl flex items-center space-x-2 transition-all active:scale-95 cursor-pointer shadow-lg"
          >
            <Plus className="w-4 h-4 text-[#0B0E14] stroke-[2.5]" />
            <span>New Contract Scan</span>
          </button>
        </div>
      </div>

      <div className="crystal-panel crystal-facet p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#293B54]">
        <div className="space-y-2">
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] font-mono text-[#94A3B8] font-bold uppercase tracking-wider">
              SMART CONTRACT THREAT POSTURE
            </span>
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold border ${postureRating.bg} ${postureRating.color} ${postureRating.border}`}>
              {postureRating.label}
            </span>
          </div>
          
          <div className="flex items-baseline space-x-3">
            <span className="text-4xl font-bold font-mono tracking-tight text-[#F3F6FA]">
              {securityScore}
            </span>
            <span className="text-xs font-mono text-[#CBD5E1] font-medium">/ 100 HEALTH INDEX</span>
          </div>

          <p className="text-xs text-[#CBD5E1] max-w-lg leading-relaxed">
            {critical > 0 
              ? `${critical} critical exploit vectors detected. Contracts require immediate remediation prior to mainnet deployment.`
              : high > 0
              ? `${high} high severity logic issues detected. Access controls and external calls need auditor review.`
              : "No critical or high severity vulnerabilities discovered in current scans."}
          </p>
        </div>

        <div className="space-y-2 w-full md:w-80">
          <div className="flex justify-between text-[11px] font-mono text-[#CBD5E1] font-semibold">
            <span>EXPOSURE GAUGE</span>
            <span className={postureRating.color}>{securityScore}% INTACT</span>
          </div>
          <div className="grid grid-cols-10 gap-1 h-3 bg-[#0B0F17] p-1 rounded-lg border border-[#293B54]">
            {Array.from({ length: 10 }).map((_, idx) => {
              const active = idx < Math.round(securityScore / 10);
              const blockColor = 
                securityScore >= 80 ? "bg-[#00E5FF] shadow-[0_0_6px_rgba(0,229,255,0.6)]" :
                securityScore >= 50 ? "bg-[#F59E0B] shadow-[0_0_6px_rgba(245,158,11,0.6)]" : "bg-[#EF4444] shadow-[0_0_6px_rgba(239,68,68,0.6)]";
              return (
                <div
                  key={idx}
                  className={`h-full rounded-[2px] transition-colors ${
                    active ? blockColor : "bg-[#17202E]"
                  }`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] font-mono text-[#94A3B8] font-bold">
            <span>HIGH RISK</span>
            <span>MODERATE</span>
            <span>OPTIMAL</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
        <div className="crystal-card crystal-facet p-5 rounded-2xl transition-all flex flex-col justify-between border border-[#293B54]/70">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-[#CBD5E1] uppercase">CRITICAL</span>
            <div className="p-1 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/30">
              <AlertCircle className="w-3.5 h-3.5 text-[#EF4444]" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-3xl font-semibold tracking-tight text-[#EF4444] font-mono">
              {String(critical).padStart(2, "0")}
            </div>
          </div>
          <div className="text-[11px] text-[#CBD5E1] font-medium leading-tight">Reentrancy & delegatecall risks</div>
        </div>

        <div className="crystal-card crystal-facet p-5 rounded-2xl transition-all flex flex-col justify-between border border-[#293B54]/70">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-[#CBD5E1] uppercase">HIGH RISK</span>
            <div className="p-1 rounded-md bg-[#F97316]/10 border border-[#F97316]/30">
              <AlertTriangle className="w-3.5 h-3.5 text-[#F97316]" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-3xl font-semibold tracking-tight text-[#F97316] font-mono">
              {String(high).padStart(2, "0")}
            </div>
          </div>
          <div className="text-[11px] text-[#CBD5E1] font-medium leading-tight">tx.origin & access control</div>
        </div>

        <div className="crystal-card crystal-facet p-5 rounded-2xl transition-all flex flex-col justify-between border border-[#293B54]/70">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-[#CBD5E1] uppercase">MEDIUM RISK</span>
            <div className="p-1 rounded-md bg-[#F59E0B]/10 border border-[#F59E0B]/30">
              <ShieldAlert className="w-3.5 h-3.5 text-[#F59E0B]" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-3xl font-semibold tracking-tight text-[#F59E0B] font-mono">
              {String(medium).padStart(2, "0")}
            </div>
          </div>
          <div className="text-[11px] text-[#CBD5E1] font-medium leading-tight">Unchecked low-level calls</div>
        </div>

        <div className="crystal-card crystal-facet p-5 rounded-2xl transition-all flex flex-col justify-between border border-[#293B54]/70">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-[#CBD5E1] uppercase">LOW RISK</span>
            <div className="p-1 rounded-md bg-[#00E5FF]/10 border border-[#00E5FF]/30">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-3xl font-semibold tracking-tight text-[#00E5FF] font-mono">
              {String(low).padStart(2, "0")}
            </div>
          </div>
          <div className="text-[11px] text-[#CBD5E1] font-medium leading-tight">Timestamp dependency</div>
        </div>

        <div className="crystal-card crystal-facet p-5 rounded-2xl transition-all flex flex-col justify-between border border-[#293B54]/70">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-[#CBD5E1] uppercase">TOTAL AUDITS</span>
            <div className="p-1 rounded-md bg-[#00E5FF]/10 border border-[#00E5FF]/30">
              <Terminal className="w-3.5 h-3.5 text-[#00E5FF]" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-3xl font-semibold tracking-tight text-[#F3F6FA] font-mono">
              {String(scans.length).padStart(2, "0")}
            </div>
          </div>
          <div className="text-[11px] text-[#CBD5E1] font-medium leading-tight">Completed scan executions</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <VulnerabilityDonutChart findings={findings} />

        <CategoryBarChart findings={findings} />

        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#1F2B3E]">
              <div>
                <div className="text-[10px] font-mono text-[#94A3B8] font-bold uppercase">ANALYSIS VELOCITY</div>
                <h3 className="text-xs font-semibold text-[#F3F6FA] uppercase tracking-wider">
                  Engine Modules
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#00E5FF] px-2 py-0.5 bg-[#00E5FF]/10 rounded-md border border-[#00E5FF]/30">
                • 4 Online
              </span>
            </div>

            <div className="py-3 space-y-2.5">
              <div className="p-2.5 bg-[#0B0F17] border border-[#1F2B3E] hover:border-[#293B54] transition-colors rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]"></div>
                  <span className="font-semibold text-[#F3F6FA]">Solidity AST Engine</span>
                </div>
                <span className="text-[10px] font-mono text-[#CBD5E1] font-medium">0.08s avg</span>
              </div>

              <div className="p-2.5 bg-[#0B0F17] border border-[#1F2B3E] hover:border-[#293B54] transition-colors rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]"></div>
                  <span className="font-semibold text-[#F3F6FA]">Slither Detector Pass</span>
                </div>
                <span className="text-[10px] font-mono text-[#CBD5E1] font-medium">0.42s avg</span>
              </div>

              <div className="p-2.5 bg-[#0B0F17] border border-[#1F2B3E] hover:border-[#293B54] transition-colors rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]"></div>
                  <span className="font-semibold text-[#F3F6FA]">Mythril Symbolic Engine</span>
                </div>
                <span className="text-[10px] font-mono text-[#CBD5E1] font-medium">0.85s avg</span>
              </div>

              <div className="p-2.5 bg-[#0B0F17] border border-[#1F2B3E] hover:border-[#293B54] transition-colors rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]"></div>
                  <span className="font-semibold text-[#F3F6FA]">EVM Gas Profiler</span>
                </div>
                <span className="text-[10px] font-mono text-[#CBD5E1] font-medium">0.02s avg</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#0B0F17] rounded-xl border border-[#293B54] text-[10px] font-mono text-[#CBD5E1] font-medium">
            Sandbox: Docker/Host Isolated • Network Guarded
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-[#293B54]/70">
        <div className="px-6 py-4 border-b border-[#1F2B3E] flex items-center justify-between bg-[#111722]/80">
          <div>
            <h3 className="text-xs font-semibold text-[#F3F6FA] uppercase tracking-wider">
              Priority Security Vulnerabilities
            </h3>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">
              Immediate exploit candidates discovered in latest scan passes
            </p>
          </div>
          {onNavigateTab && (
            <button
              onClick={() => {
                sounds.playClick();
                onNavigateTab("findings");
              }}
              className="text-xs text-[#CBD5E1] hover:text-[#00E5FF] font-semibold flex items-center space-x-1 transition-colors"
            >
              <span>View All {findings.length} Findings</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#00E5FF]" />
            </button>
          )}
        </div>

        <div className="divide-y divide-[#1F2B3E]">
          {topFindings.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#94A3B8]">
              No active security vulnerabilities detected. Run a scan to discover security flaws.
            </div>
          ) : (
            topFindings.map((f) => {
              const badge =
                f.severity === "CRITICAL"
                  ? "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30"
                  : f.severity === "HIGH"
                  ? "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30"
                  : "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30";

              return (
                <div
                  key={f.id}
                  onClick={() => {
                    sounds.playClick();
                    onSelectFinding && onSelectFinding(f);
                  }}
                  className="p-4 px-6 flex items-center justify-between hover:bg-[#17202E]/60 cursor-pointer transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1 pr-4">
                    <div className="flex items-center space-x-2.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border flex-shrink-0 ${badge}`}>
                        {f.severity}
                      </span>
                      <span className="text-xs font-semibold text-[#F3F6FA] truncate">
                        {f.title}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#CBD5E1] flex items-center space-x-2 font-mono">
                      <span className="truncate">{f.source_file}:{f.line_number || "global"}</span>
                      <span>•</span>
                      <span className="text-[#94A3B8] flex-shrink-0">{f.detector}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className="hidden sm:inline-block text-[11px] font-mono text-[#94A3B8] px-2.5 py-1 bg-[#0B0F17] rounded-lg border border-[#1F2B3E]">
                      Confidence: {f.confidence}
                    </span>
                    <button className="px-3 py-1.5 bg-[#111722] hover:bg-[#17202E] text-[#F3F6FA] rounded-lg border border-[#1F2B3E] hover:border-[#00E5FF]/40 text-xs font-medium flex items-center space-x-1 transition-all">
                      <span>Inspect</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#00E5FF]" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1F2B3E] flex items-center justify-between bg-[#111722]/80">
          <div>
            <h3 className="text-xs font-semibold text-[#F3F6FA] uppercase tracking-wider">
              Recent Audit Executions
            </h3>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Historical scan results, timing benchmarks, and severity ratios
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#94A3B8] px-2.5 py-1 bg-[#0B0F17] rounded-lg border border-[#1F2B3E]">
            {scans.length} {scans.length === 1 ? "Audit" : "Audits"} Recorded
          </span>
        </div>

        <div className="divide-y divide-[#1F2B3E]">
          {scans.length === 0 ? (
            <div className="crystal-placeholder crystal-facet m-5 p-10 text-center space-y-3 rounded-2xl">
              <div className="w-12 h-12 rounded-2xl crystal-panel flex items-center justify-center mx-auto text-[#00E5FF]">
                <Terminal className="w-5 h-5" />
              </div>
              <div className="text-xs text-[#F3F6FA] font-semibold">No smart contracts analyzed yet</div>
              <p className="text-[11px] text-[#64748B] max-w-sm mx-auto">
                Begin by uploading a Solidity contract (.sol or .zip) or entering an on-chain address in the scanner.
              </p>
              <button
                onClick={onOpenScanner}
                className="mt-2 text-xs font-bold text-[#0B0E14] bg-gradient-to-r from-cyan-400 via-cyan-300 to-amber-300 hover:from-cyan-300 hover:to-amber-200 px-4 py-2 rounded-xl transition-all shadow-[0_2px_12px_rgba(0,229,255,0.25)]"
              >
                Launch Scanner &rarr;
              </button>
            </div>
          ) : (
            scans.map((scan) => (
              <div
                key={scan.id}
                onClick={() => {
                  sounds.playClick();
                  onSelectScan && onSelectScan(scan.id);
                }}
                className="p-4 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#17202E]/60 transition-colors cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-semibold text-[#F3F6FA]">
                      Scan #{scan.id.slice(0, 8)}
                    </span>
                    <span className="text-[10px] font-mono text-[#64748B]">
                      ({scan.contract_id ? scan.contract_id.slice(0, 8) : "source"})
                    </span>
                  </div>
                  <div className="text-[11px] text-[#64748B] flex items-center space-x-2">
                    <Clock className="w-3 h-3 text-[#64748B]" />
                    <span>{scan.elapsed_time}s execution</span>
                    <span>•</span>
                    <span className="text-[#94A3B8]">{scan.current_stage}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2 text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded-md bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30">
                      {scan.critical_count} CRIT
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/30">
                      {scan.high_count} HIGH
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30">
                      {scan.medium_count} MED
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                      {scan.low_count} LOW
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase ${
                      scan.status === "COMPLETED"
                        ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30"
                        : scan.status === "RUNNING"
                        ? "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30"
                        : "bg-[#17202E] text-[#64748B] border border-[#1F2B3E]"
                    }`}
                  >
                    • {scan.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
