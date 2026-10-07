import React, { useEffect, useState, useRef } from "react";
import { getScanStatus, getScanFindings } from "@/lib/api";
import { ScanStatus, Finding } from "@/types/contract";
import { 
  CheckCircle2, 
  Clock, 
  Loader2, 
  AlertTriangle, 
  ShieldAlert, 
  Flame, 
  Terminal,
  Activity
} from "lucide-react";
import { sounds } from "@/lib/sounds";

interface RealtimeScanProgressProps {
  scanId: string;
  onScanComplete: (findings: Finding[]) => void;
}

export const RealtimeScanProgress: React.FC<RealtimeScanProgressProps> = ({ scanId, onScanComplete }) => {
  const [scan, setScan] = useState<ScanStatus | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const [logs, setLogs] = useState<Array<{ time: string; text: string; type: "info" | "success" | "warn" }>>([
    { time: "00:00", text: "Secure sandbox container initialized. Mounting Solidity workspace...", type: "info" },
  ]);

  useEffect(() => {
    if (isDone) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isDone]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const pollStatus = async () => {
      try {
        const data: ScanStatus = await getScanStatus(scanId);
        setScan(data);

        if (data.current_stage) {
          const formattedTime = `00:${String(elapsedSeconds).padStart(2, "0")}`;
          setLogs((prev) => {
            if (prev[prev.length - 1]?.text.includes(data.current_stage)) return prev;
            return [
              ...prev,
              {
                time: formattedTime,
                text: `Executing Stage: ${data.current_stage} (Engine telemetry armed)`,
                type: data.status === "COMPLETED" ? "success" : "info"
              }
            ];
          });
        }

        if (data.status === "RUNNING") {
          sounds.playScanPulse();
        }

        if (data.status === "COMPLETED") {
          setIsDone(true);
          clearInterval(interval);
          setLogs((prev) => [
            ...prev,
            { time: `00:${String(elapsedSeconds).padStart(2, "0")}`, text: "Audit pipeline completed. Findings correlated and normalized.", type: "success" }
          ]);
          const findings = await getScanFindings(scanId);
          onScanComplete(findings);
        } else if (data.status === "FAILED") {
          setIsDone(true);
          clearInterval(interval);
          setLogs((prev) => [
            ...prev,
            { time: `00:${String(elapsedSeconds).padStart(2, "0")}`, text: "Scan execution encountered an error in runner session.", type: "warn" }
          ]);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    pollStatus();
    interval = setInterval(pollStatus, 1500);

    return () => clearInterval(interval);
  }, [scanId, onScanComplete, elapsedSeconds]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  if (!scan) {
    return (
      <div className="p-16 text-center space-y-4 max-w-xl mx-auto glass-panel rounded-2xl mt-8 border border-[#293B54]">
        <div className="relative inline-flex items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#00E5FF]" />
          </div>
          <span className="animate-ping absolute inline-flex h-12 w-12 rounded-2xl bg-[#00E5FF]/20 -z-10" />
        </div>
        <div>
          <div className="text-sm font-semibold text-[#F3F6FA] font-mono">Establishing Sandbox Runner Session</div>
          <div className="text-xs text-[#94A3B8] mt-1 font-mono">Initializing isolated EVM compiler & detector workers...</div>
        </div>
      </div>
    );
  }

  const stagesList = [
    { 
      key: "validation", 
      label: "Source & Pragma Validation", 
      desc: "Verifying pragma version compatibility & AST syntax integrity" 
    },
    { 
      key: "ast", 
      label: "AST Semantic Engine Pass", 
      desc: "Constructing inheritance graphs and function call trees" 
    },
    { 
      key: "slither", 
      label: "Slither Static Detector Engine", 
      desc: "Testing 47+ vulnerability detectors (reentrancy, tx.origin, uninitialized state)" 
    },
    { 
      key: "mythril", 
      label: "Mythril Symbolic Path Execution", 
      desc: "Analyzing symbolic control flows and unchecked external transfers" 
    },
    { 
      key: "gas", 
      label: "Gas & Efficiency Profiling", 
      desc: "Auditing storage slot packing, memory vs calldata, and loop boundaries" 
    },
    { 
      key: "normalization", 
      label: "Finding Correlation & Normalization", 
      desc: "Cross-referencing AST nodes with vulnerability signatures" 
    }
  ];

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto space-y-7 glass-panel rounded-2xl mt-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent opacity-90" />

      <div>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]"></span>
              </span>
              <span className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider font-semibold">
                ACTIVE AUDIT PIPELINE
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-[#F3F6FA]">#{scanId.slice(0, 12)}</span>
              <span className="text-[10px] font-mono text-[#CBD5E1] px-1.5 py-0.5 rounded bg-[#0B0E14] border border-[#293B54]">
                Elapsed: 00:{String(elapsedSeconds).padStart(2, "0")}s
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#F3F6FA] via-[#00E5FF] to-[#F59E0B]">
              {scan.progress_percentage}%
            </span>
            <div className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-wider mt-0.5">
              {isDone ? "AUDIT COMPLETED" : "TACTICAL TELEMETRY"}
            </div>
          </div>
        </div>
        
        <div className="relative w-full h-2 bg-[#0B0E14] rounded-full overflow-hidden mt-4 border border-[#293B54] shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-teal-300 to-[#F59E0B] transition-all duration-300 relative"
            style={{ width: `${scan.progress_percentage}%` }}
          >
            <span className="absolute right-0 top-0 bottom-0 w-3 bg-white/80 rounded-full shadow-[0_0_10px_#00E5FF]" />
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-[#CBD5E1]">
          <div className="flex items-center space-x-2">
            {!isDone ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00E5FF]" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00E5FF]" />
            )}
            <span>Current Task: <strong className="text-[#F3F6FA]">{scan.current_stage || "Initializing..."}</strong></span>
          </div>
          <span className="text-[11px] font-mono text-[#94A3B8]">
            Target: Smart Contract AST
          </span>
        </div>
      </div>

      <div className="space-y-3 border-t border-[#293B54] pt-5">
        <div className="flex items-center justify-between text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">
          <span>Analysis Stages & Multi-Engine Matrix</span>
          <span className="font-mono text-[#00E5FF]">6 Engines Armed</span>
        </div>

        <div className="space-y-2">
          {stagesList.map((stage) => {
            const st = scan.stage_breakdown?.[stage.key] || "PENDING";
            const isRunning = st === "RUNNING";
            const isCompleted = st === "COMPLETED";

            return (
              <div
                key={stage.key}
                className={`flex items-center justify-between p-3 rounded-xl text-xs transition-all duration-200 ${
                  isRunning
                    ? "bg-gradient-to-r from-[#17202E] to-[#111722] border border-[#00E5FF]/50 shadow-[0_0_15px_rgba(0,229,255,0.15)]"
                    : isCompleted
                    ? "bg-[#0B0E14]/90 border border-[#293B54]"
                    : "bg-[#0B0E14]/50 border border-[#293B54]/60 opacity-60"
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0 pr-3">
                  <div className="shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-[#00E5FF]" />
                    ) : isRunning ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#00E5FF]" />
                    ) : (
                      <Clock className="w-4 h-4 text-[#94A3B8]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className={`font-medium tracking-tight truncate ${
                      isCompleted ? "text-[#F3F6FA]" : isRunning ? "text-[#F3F6FA] font-semibold" : "text-[#94A3B8]"
                    }`}>
                      {stage.label}
                    </div>
                    <div className="text-[10px] text-[#94A3B8] truncate hidden sm:block">
                      {stage.desc}
                    </div>
                  </div>
                </div>

                <span className={`font-mono text-[10px] px-2.5 py-1 rounded-md shrink-0 uppercase font-semibold ${
                  isCompleted 
                    ? "bg-[#07242E] text-[#00E5FF] border border-[#0D4B5C]" 
                    : isRunning
                    ? "bg-[#2B1F07] text-[#F59E0B] border border-[#5A3F0E] animate-pulse"
                    : "text-[#94A3B8] bg-[#111722]/60 border border-[#293B54]/60"
                }`}>
                  {st}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 border-t border-[#293B54] pt-5">
        <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
          Real-Time Vulnerability Interception
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono">
          <div className="p-3 bg-[#0B0E14] border border-[#5C1D24] rounded-xl hover:border-[#EF4444]/60 transition-colors shadow-[0_0_12px_rgba(239,68,68,0.12)]">
            <div className="flex items-center justify-between text-[10px] text-[#CBD5E1] font-semibold mb-1">
              <span>CRITICAL</span>
              <AlertTriangle className="w-3 h-3 text-[#EF4444]" />
            </div>
            <div className="text-2xl font-extrabold text-[#EF4444]">{scan.critical_count}</div>
            <div className="text-[9px] text-[#CBD5E1] mt-0.5">Direct Exploit</div>
          </div>

          <div className="p-3 bg-[#0B0E14] border border-[#5A2C10] rounded-xl hover:border-[#F97316]/60 transition-colors">
            <div className="flex items-center justify-between text-[10px] text-[#CBD5E1] font-semibold mb-1">
              <span>HIGH</span>
              <Flame className="w-3 h-3 text-[#F97316]" />
            </div>
            <div className="text-2xl font-extrabold text-[#F97316]">{scan.high_count}</div>
            <div className="text-[9px] text-[#CBD5E1] mt-0.5">Logic Flow</div>
          </div>

          <div className="p-3 bg-[#0B0E14] border border-[#5A3F0E] rounded-xl hover:border-[#F59E0B]/60 transition-colors">
            <div className="flex items-center justify-between text-[10px] text-[#CBD5E1] font-semibold mb-1">
              <span>MEDIUM</span>
              <ShieldAlert className="w-3 h-3 text-[#F59E0B]" />
            </div>
            <div className="text-2xl font-extrabold text-[#F59E0B]">{scan.medium_count}</div>
            <div className="text-[9px] text-[#CBD5E1] mt-0.5">Bad Practice</div>
          </div>

          <div className="p-3 bg-[#0B0E14] border border-[#0D4B5C] rounded-xl hover:border-[#00E5FF]/60 transition-colors shadow-[0_0_12px_rgba(0,229,255,0.08)]">
            <div className="flex items-center justify-between text-[10px] text-[#CBD5E1] font-semibold mb-1">
              <span>LOW</span>
              <Activity className="w-3 h-3 text-[#00E5FF]" />
            </div>
            <div className="text-2xl font-extrabold text-[#00E5FF]">{scan.low_count}</div>
            <div className="text-[9px] text-[#CBD5E1] mt-0.5">Optimization</div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#1F2B3E] pt-5 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider font-mono">
          <div className="flex items-center space-x-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Sandbox Execution Stream</span>
          </div>
          <span className="text-[#00E5FF] animate-pulse">● STREAMING</span>
        </div>

        <div className="bg-[#070A0F] border border-[#293B54] rounded-xl p-3.5 h-28 overflow-y-auto font-mono text-[11px] space-y-1.5 select-text">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start space-x-2 leading-tight">
              <span className="text-[#94A3B8] shrink-0 font-medium">[{log.time}]</span>
              <span className={
                log.type === "success" 
                  ? "text-[#00E5FF]" 
                  : log.type === "warn" 
                  ? "text-[#EF4444]" 
                  : "text-[#F3F6FA]/90"
              }>
                {log.text}
              </span>
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
};
