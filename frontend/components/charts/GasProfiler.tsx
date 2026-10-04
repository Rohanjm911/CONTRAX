import React from "react";
import { GasAnalysisItem } from "@/types/contract";
import { Database, ArrowRightLeft, Repeat, HelpCircle } from "lucide-react";

interface GasProfilerProps {
  gasData: GasAnalysisItem[];
  onOpenGuide?: () => void;
}

export const GasProfiler: React.FC<GasProfilerProps> = ({ gasData, onOpenGuide }) => {
  const totalWrites = gasData.reduce((acc, curr) => acc + curr.storage_writes_count, 0);
  const totalCalls = gasData.reduce((acc, curr) => acc + curr.external_calls_count, 0);
  const totalLoops = gasData.reduce((acc, curr) => acc + curr.loops_detected, 0);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-5 sm:space-y-7">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#1F2B3E] gap-4">
        <div>
          <div className="text-[11px] font-mono text-[#64748B] uppercase tracking-wider mb-1 flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]"></span>
            <span>EVM EFFICIENCY & PROFILING</span>
          </div>
          <h2 className="text-xl font-semibold text-[#F3F6FA] tracking-tight font-mono">
            Gas & Loop Execution Profiler
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Static operation estimation: Storage writes (SSTORE), external invocations, and loop hazards.
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
            Status: ESTIMATED STATICALLY
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="crystal-card crystal-facet p-5 rounded-2xl flex flex-col justify-between border border-[#1F2B3E] hover:border-[#F59E0B]/40 transition-all">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">SSTORE Storage Writes</span>
            <div className="p-1.5 rounded-md bg-[#F59E0B]/10 border border-[#F59E0B]/30">
              <Database className="w-3.5 h-3.5 text-[#F59E0B]" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-semibold font-mono text-[#F3F6FA]">
              {totalWrites}
            </div>
          </div>
          <div className="text-[11px] text-[#64748B]">~5,000 - 20,000 gas per slot write</div>
        </div>

        <div className="crystal-card crystal-facet p-5 rounded-2xl flex flex-col justify-between border border-[#1F2B3E] hover:border-[#00E5FF]/40 transition-all">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">External Calls</span>
            <div className="p-1.5 rounded-md bg-[#00E5FF]/10 border border-[#00E5FF]/30">
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#00E5FF]" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-semibold font-mono text-[#F3F6FA]">
              {totalCalls}
            </div>
          </div>
          <div className="text-[11px] text-[#64748B]">~2,600 gas base per non-warm target</div>
        </div>

        <div className="crystal-card crystal-facet p-5 rounded-2xl flex flex-col justify-between border border-[#1F2B3E] hover:border-[#EF4444]/40 transition-all">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Unbounded Loops</span>
            <div className="p-1.5 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/30">
              <Repeat className="w-3.5 h-3.5 text-[#EF4444]" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-semibold font-mono text-[#EF4444]">
              {totalLoops}
            </div>
          </div>
          <div className="text-[11px] text-[#64748B]">Potential block gas limit exhaustion risk</div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden shadow-sm border border-[#1F2B3E]">
        <div className="px-6 py-4 border-b border-[#1F2B3E] bg-[#111722]/80 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-[#F3F6FA] uppercase tracking-wider font-mono">
            Function Gas Benchmarks
          </h3>
          <span className="text-[11px] font-mono text-[#94A3B8] px-2.5 py-0.5 bg-[#0B0F17] rounded-lg border border-[#1F2B3E]">
            {gasData.length} Functions Profiled
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs min-w-[640px]">
            <thead>
              <tr className="bg-[#111722]/90 border-b border-[#1F2B3E] text-[#94A3B8]">
                <th className="py-3 px-5 font-semibold text-[11px] uppercase tracking-wider">Function</th>
                <th className="py-3 px-5 font-semibold text-[11px] uppercase tracking-wider w-28">Reliability</th>
                <th className="py-3 px-5 font-semibold text-[11px] uppercase tracking-wider font-mono w-32">Est. Min Gas</th>
                <th className="py-3 px-5 font-semibold text-[11px] uppercase tracking-wider font-mono w-32">Est. Max Gas</th>
                <th className="py-3 px-5 font-semibold text-[11px] uppercase tracking-wider font-mono w-28 text-center">SSTORE Writes</th>
                <th className="py-3 px-5 font-semibold text-[11px] uppercase tracking-wider font-mono w-28 text-center">Ext. Calls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2B3E]">
              {gasData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#64748B]">
                    No gas profiles available for current scan. Run a scan on a contract containing functions.
                  </td>
                </tr>
              ) : (
                gasData.map((item) => (
                  <tr key={item.id} className="hover:bg-[#17202E]/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-medium text-[#F3F6FA]">
                      {item.function_name}()
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[10px] text-[#94A3B8]">
                      <span className="px-2 py-0.5 bg-[#0B0F17] border border-[#1F2B3E] rounded-md">
                        {item.reliability}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[#00E5FF] font-semibold">
                      {item.min_gas?.toLocaleString()} gas
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[#F59E0B]">
                      {item.max_gas?.toLocaleString()} gas
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[#F3F6FA] text-center">
                      {item.storage_writes_count}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[#F3F6FA] text-center">
                      {item.external_calls_count}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
