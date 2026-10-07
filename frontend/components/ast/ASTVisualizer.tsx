import React, { useState } from "react";
import { ChevronRight, ChevronDown, Box, Cpu, Bell, Shield, Layers, HelpCircle } from "lucide-react";

interface ASTVisualizerProps {
  astData: any;
  onOpenGuide?: () => void;
}

export const ASTVisualizer: React.FC<ASTVisualizerProps> = ({ astData, onOpenGuide }) => {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    contract_0: true,
  });

  const toggleNode = (nodeKey: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeKey]: !prev[nodeKey] }));
  };

  const contracts = astData?.contracts || [];

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-56px)] overflow-hidden">
      <div className="w-full md:w-1/2 h-1/2 md:h-full bg-[#0B0F17] border-b md:border-b-0 md:border-r border-[#293B54] p-4 sm:p-6 overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#293B54] mb-5">
          <div>
            <div className="text-[10px] font-mono text-[#94A3B8] font-bold uppercase">PARSER HIERARCHY</div>
            <h3 className="text-sm font-semibold text-[#F3F6FA] tracking-tight font-mono">
              Abstract Syntax Tree (AST) Explorer
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {onOpenGuide && (
              <button
                onClick={onOpenGuide}
                className="flex items-center space-x-1 px-2.5 py-1 glass-panel hover:bg-[#17202E] text-[#F3F6FA] rounded-lg text-xs font-semibold border border-[#293B54] hover:border-[#00E5FF]/40 transition-all"
                title="How to use AST Explorer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span className="text-[11px]">Guide</span>
              </button>
            )}
            <span className="text-[10px] font-mono text-[#CBD5E1] px-2.5 py-0.5 bg-[#111722] rounded-md border border-[#293B54] font-semibold">
              {contracts.length} {contracts.length === 1 ? "Contract" : "Contracts"}
            </span>
          </div>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {contracts.map((contract: any, cIdx: number) => {
            const cKey = `contract_${cIdx}`;
            const isContractOpen = expandedNodes[cKey] !== false;

            return (
              <div key={cKey} className="border border-[#293B54] hover:border-[#00E5FF]/40 rounded-2xl bg-[#111722] p-3 space-y-2 transition-all">
                <div
                  onClick={() => {
                    toggleNode(cKey);
                    setSelectedNode({ type: "ContractDefinition", ...contract });
                  }}
                  className="flex items-center space-x-2 text-[#F3F6FA] font-semibold cursor-pointer p-1.5 rounded-lg hover:bg-[#17202E] transition-colors"
                >
                  {isContractOpen ? (
                    <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
                  )}
                  <Box className="w-4 h-4 text-[#00E5FF]" />
                  <span>{contract.name}</span>
                  <span className="text-[10px] text-[#94A3B8] font-sans font-normal">
                    ({contract.type})
                  </span>
                </div>

                {isContractOpen && (
                  <div className="pl-6 pt-1 space-y-3">
                    {contract.stateVariables?.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-semibold text-[#94A3B8] flex items-center space-x-1.5 uppercase font-sans">
                          <Cpu className="w-3.5 h-3.5 text-[#F59E0B]" />
                          <span>State Variables ({contract.stateVariables.length})</span>
                        </div>
                        <div className="pl-3 space-y-0.5 border-l border-[#293B54]">
                          {contract.stateVariables.map((v: any, vIdx: number) => (
                            <div
                              key={vIdx}
                              onClick={() => setSelectedNode({ type: "VariableDeclaration", ...v })}
                              className="text-[11px] text-[#F3F6FA] hover:bg-[#17202E] px-2 py-1 rounded-md cursor-pointer flex items-center justify-between transition-colors"
                            >
                              <span>
                                <span className="text-[#F59E0B]">{v.type}</span> {v.name}
                              </span>
                              <span className="text-[10px] text-[#94A3B8]">Line {v.line}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {contract.functions?.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-semibold text-[#94A3B8] flex items-center space-x-1.5 uppercase font-sans">
                          <Shield className="w-3.5 h-3.5 text-[#00E5FF]" />
                          <span>Functions ({contract.functions.length})</span>
                        </div>
                        <div className="pl-3 space-y-0.5 border-l border-[#293B54]">
                          {contract.functions.map((fn: any, fnIdx: number) => (
                            <div
                              key={fnIdx}
                              onClick={() => setSelectedNode({ type: "FunctionDefinition", ...fn })}
                              className="text-[11px] text-[#F3F6FA] hover:bg-[#17202E] px-2 py-1 rounded-md cursor-pointer flex items-center justify-between transition-colors"
                            >
                              <span>{fn.name || "fallback"}()</span>
                              <span className="text-[10px] text-[#94A3B8] font-mono">
                                {fn.visibility}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {contract.events?.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-semibold text-[#94A3B8] flex items-center space-x-1.5 uppercase font-sans">
                          <Bell className="w-3.5 h-3.5 text-[#38BDF8]" />
                          <span>Events ({contract.events.length})</span>
                        </div>
                        <div className="pl-3 space-y-0.5 border-l border-[#1F2B3E]">
                          {contract.events.map((ev: any, evIdx: number) => (
                            <div
                              key={evIdx}
                              onClick={() => setSelectedNode({ type: "EventDefinition", ...ev })}
                              className="text-[11px] text-[#F3F6FA] hover:bg-[#17202E] px-2 py-1 rounded-md cursor-pointer transition-colors"
                            >
                              event {ev.name}({ev.params})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full md:w-1/2 h-1/2 md:h-full bg-[#111722] p-4 sm:p-6 overflow-y-auto">
        <div className="pb-4 border-b border-[#293B54] mb-5">
          <div className="text-[10px] font-mono text-[#94A3B8] uppercase">PROPERTY INSPECTOR</div>
          <h3 className="text-sm font-semibold text-[#F3F6FA] tracking-tight font-mono">
            Node Attributes & Scope
          </h3>
        </div>

        {selectedNode ? (
          <div className="space-y-4">
            <div className="p-4 bg-[#0B0F17] border border-[#293B54] rounded-xl">
              <div className="text-[10px] font-mono text-[#94A3B8] uppercase">NODE CLASSIFICATION</div>
              <div className="text-sm font-bold text-[#00E5FF] font-mono mt-0.5">
                {selectedNode.type}
              </div>
            </div>

            <div className="p-4 bg-[#0B0F17] border border-[#293B54] rounded-xl space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[#293B54]">
                <span className="text-[#94A3B8]">Identifier</span>
                <span className="text-[#F3F6FA] font-mono font-semibold">{selectedNode.name}</span>
              </div>
              {selectedNode.line && (
                <div className="flex justify-between py-1 border-b border-[#293B54]">
                  <span className="text-[#94A3B8]">Source Line</span>
                  <span className="text-[#F3F6FA] font-mono">{selectedNode.line}</span>
                </div>
              )}
              {selectedNode.visibility && (
                <div className="flex justify-between py-1 border-b border-[#293B54]">
                  <span className="text-[#94A3B8]">Visibility Scope</span>
                  <span className="text-[#F3F6FA] font-mono">{selectedNode.visibility}</span>
                </div>
              )}
              {selectedNode.mutability && (
                <div className="flex justify-between py-1 border-b border-[#293B54]">
                  <span className="text-[#94A3B8]">State Mutability</span>
                  <span className="text-[#F3F6FA] font-mono">{selectedNode.mutability}</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#0B0F17] border border-[#293B54] rounded-xl">
              <div className="text-[10px] font-mono text-[#94A3B8] uppercase mb-2">RAW SYNTAX OBJECT</div>
              <pre className="text-[11px] font-mono text-[#F3F6FA] overflow-x-auto p-2.5 bg-[#111722] rounded-lg border border-[#293B54]">
                {JSON.stringify(selectedNode, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="crystal-placeholder crystal-facet p-12 text-center text-xs text-[#CBD5E1] space-y-3 rounded-2xl border border-[#293B54]">
            <div className="w-12 h-12 rounded-2xl crystal-panel flex items-center justify-center mx-auto text-[#00E5FF]">
              <Layers className="w-5 h-5" />
            </div>
            <div className="font-semibold text-[#F3F6FA]">Select an AST Hierarchy Node</div>
            <div className="max-w-xs mx-auto text-[11px] leading-relaxed text-[#94A3B8]">
              Click any contract, function, state variable, or event in the left outline to inspect scope, visibility, and raw syntax tokens.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
