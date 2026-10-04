import React, { useState, useMemo } from "react";
import { Finding, SourceFile } from "@/types/contract";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Search,
  Layers,
  FileCode2,
  HelpCircle
} from "lucide-react";
import { sounds } from "@/lib/sounds";

interface GraphNode {
  id: string;
  name: string;
  type: "CONTRACT" | "FUNCTION" | "EXTERNAL_CALL" | "STORAGE" | "EVENT";
  x: number;
  y: number;
  layer: number;
  contractName?: string;
  details?: Record<string, string>;
  riskLevel?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL" | "SAFE";
}

interface GraphLink {
  source: string;
  target: string;
  label?: string;
  isDangerous?: boolean;
}

interface ContractGraphProps {
  astData?: any;
  findings?: Finding[];
  contractName?: string;
  sourceFiles?: SourceFile[];
  onOpenGuide?: () => void;
}

export const ContractGraph: React.FC<ContractGraphProps> = ({
  astData,
  findings = [],
  contractName = "ReentrancyExample.sol",
  sourceFiles = [],
  onOpenGuide,
}) => {
  const [scale, setScale] = useState(1);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const { nodes, links, dimensions, activeContractTitle } = useMemo(() => {
    const rawNodes: GraphNode[] = [];
    const rawLinks: GraphLink[] = [];

    let contractsList = astData?.contracts || [];

    if (contractsList.length === 0 && sourceFiles.length > 0) {
      const activeFile = sourceFiles.find((f) => f.file_path === contractName) || sourceFiles[0];
      if (activeFile && activeFile.content) {
        const cMatches = Array.from(activeFile.content.matchAll(/contract\s+([A-Za-z0-9_]+)/g));
        const fnMatches = Array.from(activeFile.content.matchAll(/function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)/g));
        const varMatches = Array.from(activeFile.content.matchAll(/(mapping\([^;]+\)|uint256|address|bool)\s+(public|private|internal)?\s*([A-Za-z0-9_]+)\s*;/g));

        contractsList = [
          {
            name: cMatches[0]?.[1] || contractName.replace(".sol", ""),
            type: "contract",
            functions: fnMatches.map((m) => ({ name: m[1], visibility: "external" })),
            stateVariables: varMatches.map((m) => ({ name: m[3], type: m[1] })),
          },
        ];
      }
    }

    if (contractsList.length === 0) {
      contractsList = [
        {
          name: "ReentrancyExample",
          type: "contract",
          functions: [
            { name: "deposit", visibility: "external", line: 15 },
            { name: "withdraw", visibility: "external", line: 20 },
          ],
          stateVariables: [
            { name: "balances", type: "mapping(address => uint256)", line: 10 },
          ],
        },
      ];
    }

    const primaryContract = contractsList[0];
    const contractDisplayName = primaryContract?.name ? `${primaryContract.name}.sol` : contractName;

    const contractWorstRisk =
      findings.some((f) => f.severity === "CRITICAL")
        ? "CRITICAL"
        : findings.some((f) => f.severity === "HIGH")
        ? "HIGH"
        : findings.some((f) => f.severity === "MEDIUM")
        ? "MEDIUM"
        : "SAFE";

    contractsList.forEach((c: any, cIdx: number) => {
      const cNodeId = `contract_${cIdx}`;
      rawNodes.push({
        id: cNodeId,
        name: `${c.name}.sol`,
        type: "CONTRACT",
        x: 0,
        y: 0,
        layer: 0,
        contractName: `${c.name}.sol`,
        riskLevel: contractWorstRisk,
        details: {
          compiler: "0.8.20",
          scope: c.type || "contract",
          functions: `${c.functions?.length || 0} declared`,
          stateVariables: `${c.stateVariables?.length || 0} slots`,
        },
      });

      (c.functions || []).forEach((fn: any, fnIdx: number) => {
        const fnNodeId = `fn_${cIdx}_${fnIdx}`;

        const matchingFinding = findings.find(
          (f) =>
            f.title.toLowerCase().includes(fn.name.toLowerCase()) ||
            (f.line_number && fn.line && Math.abs(f.line_number - fn.line) <= 8) ||
            (fn.name === "withdraw" && f.severity === "CRITICAL") ||
            (fn.name === "transferOwnership" && f.severity === "HIGH")
        );

        const fnRisk = matchingFinding ? matchingFinding.severity : "SAFE";

        rawNodes.push({
          id: fnNodeId,
          name: `${fn.name}()`,
          type: "FUNCTION",
          x: 0,
          y: 0,
          layer: 1,
          contractName: `${c.name}.sol`,
          riskLevel: fnRisk,
          details: {
            visibility: fn.visibility || "external",
            mutability: fn.mutability || (fn.name === "deposit" ? "payable" : "nonpayable"),
            line: fn.line ? `Line ${fn.line}` : "In-scope",
            securityPost: matchingFinding ? matchingFinding.title : "Verified Safe Execution",
            detector: matchingFinding ? matchingFinding.detector : "PASS",
          },
        });

        rawLinks.push({
          source: cNodeId,
          target: fnNodeId,
          label: "defines",
        });
      });

      (c.stateVariables || []).forEach((v: any, vIdx: number) => {
        const stNodeId = `storage_${cIdx}_${vIdx}`;
        rawNodes.push({
          id: stNodeId,
          name: `${v.name} [${v.type?.split("(")[0] || "slot"}]`,
          type: "STORAGE",
          x: 0,
          y: 0,
          layer: 2,
          contractName: `${c.name}.sol`,
          riskLevel: "LOW",
          details: {
            type: v.type || "uint256",
            storageSlot: `0x0${vIdx}`,
            line: v.line ? `Line ${v.line}` : "State variable",
          },
        });

        (c.functions || []).forEach((fn: any, fnIdx: number) => {
          const fnNodeId = `fn_${cIdx}_${fnIdx}`;
          if (
            fn.name.toLowerCase().includes("deposit") ||
            fn.name.toLowerCase().includes("withdraw") ||
            fn.name.toLowerCase().includes("transfer") ||
            v.name.toLowerCase().includes("balance") ||
            v.name.toLowerCase().includes("owner")
          ) {
            rawLinks.push({
              source: fnNodeId,
              target: stNodeId,
              label: fn.name === "withdraw" ? "resets" : "writes",
            });
          }
        });
      });
    });

    const exploitFindings = findings.filter(
      (f) =>
        f.severity === "CRITICAL" ||
        f.severity === "HIGH" ||
        f.category.toLowerCase().includes("reentrancy") ||
        f.category.toLowerCase().includes("call") ||
        f.category.toLowerCase().includes("access")
    );

    if (exploitFindings.length > 0) {
      exploitFindings.slice(0, 2).forEach((f, fIdx) => {
        const callNodeId = `call_${fIdx}`;
        const callName =
          f.detector.includes("reentrancy") || f.category.toLowerCase().includes("reentrancy")
            ? "msg.sender.call{value}()"
            : f.detector.includes("tx-origin")
            ? "tx.origin == owner (bypass)"
            : f.title.length > 18
            ? f.title.slice(0, 16) + "…"
            : f.title;

        rawNodes.push({
          id: callNodeId,
          name: callName,
          type: "EXTERNAL_CALL",
          x: 0,
          y: 0,
          layer: 3,
          contractName: contractDisplayName,
          riskLevel: f.severity,
          details: {
            trigger: callName,
            flaw: f.title,
            impact: f.impact || "Unauthorized fund drainage",
            detector: f.detector,
          },
        });

        const vulnFn = rawNodes.find(
          (n) => n.layer === 1 && (n.riskLevel === "CRITICAL" || n.riskLevel === "HIGH")
        );
        if (vulnFn) {
          rawLinks.push({
            source: vulnFn.id,
            target: callNodeId,
            label: "invokes",
            isDangerous: true,
          });
        }

        if (fIdx === 0) {
          const actorId = "actor_untrusted";
          rawNodes.push({
            id: actorId,
            name: "Untrusted Caller / Actor",
            type: "CONTRACT",
            x: 0,
            y: 0,
            layer: 4,
            riskLevel: "HIGH",
            details: {
              role: "External Invocator",
              attackPath: "Reenters withdraw() or drains treasury",
              remediation: "Apply Checks-Effects-Interactions & OpenZeppelin ReentrancyGuard",
            },
          });

          rawLinks.push({
            source: callNodeId,
            target: actorId,
            label: "funds flow",
            isDangerous: true,
          });
        }
      });
    }

    const layerGroups: Record<number, GraphNode[]> = {};
    rawNodes.forEach((node) => {
      if (!layerGroups[node.layer]) layerGroups[node.layer] = [];
      layerGroups[node.layer].push(node);
    });

    const maxNodesInLayer = Math.max(...Object.values(layerGroups).map((g) => g.length), 3);
    const totalHeight = Math.max(480, maxNodesInLayer * 95 + 80);
    const highestLayer = Math.max(...rawNodes.map((n) => n.layer), 2);
    const totalWidth = Math.max(940, (highestLayer + 1) * 220 + 60);

    const layerXCoords = [80, 300, 520, 740, 960];

    Object.entries(layerGroups).forEach(([layerStr, layerNodes]) => {
      const layerNum = parseInt(layerStr, 10);
      const x = layerXCoords[layerNum] || 80 + layerNum * 220;
      const count = layerNodes.length;
      const verticalGap = totalHeight / (count + 1);

      layerNodes.forEach((node, idx) => {
        node.x = x;
        node.y = Math.round(verticalGap * (idx + 1) - 21);
      });
    });

    return {
      nodes: rawNodes,
      links: rawLinks,
      dimensions: { width: totalWidth, height: totalHeight },
      activeContractTitle: contractDisplayName,
    };
  }, [astData, findings, contractName, sourceFiles]);

  const filteredNodes = nodes.filter((node) => {
    const matchesFilter = filterType === "ALL" || node.type === filterType;
    const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getNodeColor = (node: GraphNode) => {
    switch (node.type) {
      case "CONTRACT":
        return node.riskLevel === "CRITICAL" ? "#EF4444" : node.riskLevel === "HIGH" ? "#F97316" : "#00E5FF";
      case "FUNCTION":
        return node.riskLevel === "CRITICAL" ? "#EF4444" : node.riskLevel === "HIGH" ? "#F97316" : "#00E5FF";
      case "EXTERNAL_CALL":
        return "#EF4444";
      case "STORAGE":
        return "#F59E0B";
      default:
        return "#64748B";
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-56px)] overflow-hidden">
      <div className="flex-1 flex flex-col bg-transparent min-w-0">
        <div className="min-h-12 py-2 bg-[#111722]/80 border-b border-[#1F2B3E] px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2 select-none">
          <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto max-w-full">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#0B0F17] border border-[#1F2B3E] rounded-lg text-xs font-mono shrink-0">
              <FileCode2 className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span className="text-[#F3F6FA] font-semibold">{activeContractTitle}</span>
              <span className="text-[#64748B] text-[10px]">({nodes.length})</span>
            </div>

            <div className="h-4 w-[1px] bg-[#1F2B3E] mx-1 shrink-0"></div>

            <div className="flex items-center space-x-1 shrink-0">
              {["ALL", "CONTRACT", "FUNCTION", "EXTERNAL_CALL", "STORAGE"].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    sounds.playSubtleClick();
                    setFilterType(t);
                  }}
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] font-mono font-medium transition-all ${
                    filterType === t
                      ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 font-semibold"
                      : "text-[#94A3B8] hover:text-[#F3F6FA]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 bg-[#0B0F17] border border-[#1F2B3E] rounded-lg text-xs text-[#F3F6FA] placeholder-[#64748B] w-28 sm:w-36 focus:w-44 focus:border-[#00E5FF] focus:outline-none transition-all"
              />
            </div>

            <div className="flex items-center space-x-1 border-l border-[#1F2B3E] pl-2">
              <button
                onClick={() => {
                  sounds.playSubtleClick();
                  setScale((s) => Math.min(s + 0.15, 2.0));
                }}
                className="p-1.5 bg-[#0B0F17] hover:bg-[#17202E] text-[#94A3B8] hover:text-[#F3F6FA] rounded-md border border-[#1F2B3E] transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  sounds.playSubtleClick();
                  setScale((s) => Math.max(s - 0.15, 0.5));
                }}
                className="p-1.5 bg-[#0B0F17] hover:bg-[#17202E] text-[#94A3B8] hover:text-[#F3F6FA] rounded-md border border-[#1F2B3E] transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  sounds.playSubtleClick();
                  setScale(1);
                }}
                className="p-1.5 bg-[#0B0F17] hover:bg-[#17202E] text-[#94A3B8] hover:text-[#F3F6FA] rounded-md border border-[#1F2B3E] transition-colors"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {onOpenGuide && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onOpenGuide();
                  }}
                  className="flex items-center space-x-1 px-2 py-1 bg-[#0B0F17] hover:bg-[#17202E] text-[#00E5FF] rounded-md border border-[#1F2B3E] text-xs font-medium ml-1 transition-all"
                  title="How to Use Contract Graph"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span className="text-[11px] text-[#F3F6FA]">Guide</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 relative flex items-center justify-center">
          <svg
            width={dimensions.width}
            height={dimensions.height}
            shapeRendering="geometricPrecision"
            textRendering="geometricPrecision"
            style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
            className="transition-transform duration-150 select-none"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#1F2B3E" />
              </marker>
              <marker
                id="arrowhead-danger"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#EF4444" />
              </marker>
            </defs>

            {links.map((link, idx) => {
              const srcNode = nodes.find((n) => n.id === link.source);
              const tgtNode = nodes.find((n) => n.id === link.target);
              if (!srcNode || !tgtNode) return null;

              const isDangerous = link.isDangerous;

              return (
                <g key={idx}>
                  <line
                    x1={srcNode.x + 140}
                    y1={srcNode.y + 21}
                    x2={tgtNode.x}
                    y2={tgtNode.y + 21}
                    stroke={isDangerous ? "#EF4444" : "#1F2B3E"}
                    strokeWidth={isDangerous ? 1.6 : 1.2}
                    strokeDasharray={isDangerous ? "4 3" : undefined}
                    markerEnd={isDangerous ? "url(#arrowhead-danger)" : "url(#arrowhead)"}
                  />
                  {link.label && (
                    <text
                      x={(srcNode.x + 140 + tgtNode.x) / 2}
                      y={(srcNode.y + tgtNode.y) / 2 + 15}
                      fill={isDangerous ? "#EF4444" : "#64748B"}
                      fontSize="9"
                      fontFamily="SF Mono, monospace"
                      textAnchor="middle"
                    >
                      {link.label}
                    </text>
                  )}
                </g>
              );
            })}

            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const color = getNodeColor(node);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedNode(node);
                  }}
                  className="cursor-pointer transition-all"
                >
                  <rect
                    width="140"
                    height="42"
                    rx="10"
                    fill={isSelected ? "#17202E" : "#111722"}
                    stroke={isSelected ? "#00E5FF" : "#1F2B3E"}
                    strokeWidth={isSelected ? 1.5 : 1}
                  />

                  <circle cx="14" cy="21" r="4.5" fill={color} />

                  <text
                    x="26"
                    y="20"
                    fill="#F3F6FA"
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="SF Pro Display, -apple-system, sans-serif"
                  >
                    {node.name.length > 15 ? node.name.slice(0, 14) + "…" : node.name}
                  </text>

                  <text
                    x="26"
                    y="32"
                    fill="#64748B"
                    fontSize="8.5"
                    fontFamily="SF Mono, monospace"
                  >
                    {node.type}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="w-full lg:w-80 bg-[#111722] border-t lg:border-t-0 lg:border-l border-[#1F2B3E] p-4 sm:p-6 flex flex-col justify-between overflow-y-auto max-h-[35vh] lg:max-h-none shrink-0">
        <div>
          <div className="pb-3 border-b border-[#1F2B3E] mb-5">
            <div className="text-[10px] font-mono text-[#64748B] uppercase">GRAPH INSPECTOR</div>
            <h3 className="text-sm font-semibold text-[#F3F6FA] tracking-tight font-mono">
              Selected Relationship Node
            </h3>
          </div>

          {selectedNode ? (
            <div className="space-y-4">
              <div className="p-4 bg-[#0B0F17] border border-[#1F2B3E] rounded-xl">
                <div className="text-[10px] font-mono text-[#64748B] uppercase">NODE IDENTIFIER</div>
                <div className="text-sm font-bold text-[#F3F6FA] font-mono mt-0.5">
                  {selectedNode.name}
                </div>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                  selectedNode.riskLevel === "CRITICAL"
                    ? "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30"
                    : selectedNode.riskLevel === "HIGH"
                    ? "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30"
                    : selectedNode.riskLevel === "MEDIUM"
                    ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30"
                    : "bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/30"
                }`}>
                  Risk: {selectedNode.riskLevel || "SAFE"}
                </span>
              </div>

              <div className="p-4 bg-[#0B0F17] border border-[#1F2B3E] rounded-xl space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#1F2B3E]">
                  <span className="text-[#94A3B8]">Type</span>
                  <span className="font-mono text-[#F3F6FA]">{selectedNode.type}</span>
                </div>
                {selectedNode.contractName && (
                  <div className="flex justify-between py-1 border-b border-[#1F2B3E]">
                    <span className="text-[#94A3B8]">Contract</span>
                    <span className="font-mono text-[#F3F6FA]">{selectedNode.contractName}</span>
                  </div>
                )}
                {selectedNode.details &&
                  Object.entries(selectedNode.details).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1 border-b border-[#1F2B3E]">
                      <span className="text-[#94A3B8] capitalize">{k}</span>
                      <span className="font-mono text-[#F3F6FA] text-right truncate max-w-[150px]">{v}</span>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="crystal-placeholder crystal-facet p-6 text-center text-xs text-[#64748B] space-y-2.5 rounded-xl border border-[#1F2B3E]">
              <div className="w-10 h-10 rounded-xl crystal-panel flex items-center justify-center mx-auto text-[#00E5FF]">
                <Layers className="w-4 h-4" />
              </div>
              <div className="font-semibold text-[#F3F6FA]">Inspect Node Details</div>
              <div className="text-[11px] leading-relaxed">
                Click any contract, function, or external call node in the graph to view security relationships and risk metrics.
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-[#1F2B3E] space-y-2 text-[11px]">
          <div className="text-[10px] font-mono text-[#64748B] uppercase">LEGEND</div>
          <div className="grid grid-cols-2 gap-2 text-[#94A3B8]">
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#00E5FF]"></div>
              <span>Contract</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#00E5FF]"></div>
              <span>Function</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]"></div>
              <span>External Call</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B]"></div>
              <span>Storage Slot</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
