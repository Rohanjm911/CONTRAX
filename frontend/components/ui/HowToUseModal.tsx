import React, { useState, useEffect } from "react";
import { 
  X, 
  Activity, 
  Terminal, 
  FileCode2, 
  Layers, 
  Network, 
  ShieldAlert, 
  Flame, 
  FileText, 
  CheckCircle2, 
  Sparkles,
  Search,
  BookOpen
} from "lucide-react";
import { sounds } from "@/lib/sounds";

export interface FeatureGuide {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badgeColor: string;
  badgeText: string;
  description: string;
  steps: { title: string; desc: string }[];
  proTips: string[];
}

const FEATURE_GUIDES: FeatureGuide[] = [
  {
    id: "dashboard",
    title: "Executive Operations Console",
    subtitle: "Real-time threat posture scoring and cybersecurity KPI telemetry",
    icon: Activity,
    badgeColor: "text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/30",
    badgeText: "Overview",
    description: "The Operations Console provides a high-level executive security overview across all smart contract audit sessions, displaying normalized risk metrics and system health.",
    steps: [
      {
        title: "Check Threat Posture (0-100 Health Score)",
        desc: "Review your contract's health index. A score >= 85 is DEFENDED, 60-84 is MODERATE RISK, and < 60 indicates CRITICAL EXPOSURE requiring immediate remediation."
      },
      {
        title: "Monitor Severity Distribution Gauges",
        desc: "Inspect the custom SVG Severity Ratio Donut and SWC Taxonomy Category Bars to identify what exploit types are prevalent."
      },
      {
        title: "Inspect Actionable Findings Stream",
        desc: "Click directly on any high-priority vulnerability card in the stream to open its detailed inspector or jump to source code."
      },
      {
        title: "Review Audit Execution Benchmarks",
        desc: "Track execution times and multi-engine processing speeds across Slither, Mythril, AST, and EVM Gas passes."
      }
    ],
    proTips: [
      "Click 'Contract Graph' in the top action bar to jump directly into the visual relationship mapper.",
      "The exposure gauge color dynamically shifts between Cyber Cyan, Tactical Amber, and Threat Ruby based on mathematical risk penalties."
    ]
  },
  {
    id: "scanner",
    title: "Vulnerability Scanner",
    subtitle: "Multi-engine static AST analysis, Slither passes, and Mythril symbolic execution",
    icon: Terminal,
    badgeColor: "text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/30",
    badgeText: "Analyzer Engine",
    description: "Launch automated security scans on untrusted Solidity source code (.sol / .zip) or directly query verified bytecode from supported EVM blockchains.",
    steps: [
      {
        title: "Choose Input Mode: Source File vs. On-Chain",
        desc: "Select 'Source Code Analysis' to upload a local .sol file or .zip archive, or select 'On-Chain Address Audit' to query verified contracts on Ethereum, Sepolia, Arbitrum, Base, etc."
      },
      {
        title: "Load Test Fixtures (Optional)",
        desc: "Click on 'ReentrancyExample.sol' or 'AccessControlExample.sol' in the Test Fixtures panel to instantly load intentionally vulnerable benchmark contracts."
      },
      {
        title: "Execute 'Run Security Scan'",
        desc: "Click the primary action button to dispatch the isolated backend sandbox. Watch real-time progress across AST, Slither, Mythril, and Gas profiling stages."
      },
      {
        title: "Automated Result Hand-off",
        desc: "Once the pipeline completes, CONTRAX will automatically navigate to the Findings matrix with all vulnerabilities correlated."
      }
    ],
    proTips: [
      "ZIP uploads automatically guard against ZIP-slip path traversal and recursive extraction bombs.",
      "Pragmas are extracted automatically, ensuring compatibility with Solidity ^0.8.x syntax."
    ]
  },
  {
    id: "source-viewer",
    title: "Monaco Source Code Viewer",
    subtitle: "Embedded VS Code editor with inline security markers and hover jump diagnostics",
    icon: FileCode2,
    badgeColor: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30",
    badgeText: "Interactive IDE",
    description: "Inspect the full smart contract source code in an auditor-grade Monaco environment featuring live vulnerability squigglies, line numbering, and jump-to-source navigation.",
    steps: [
      {
        title: "Browse Files in Target Sources Sidebar",
        desc: "Click on any Solidity file in the left Finder hierarchy to load its code into the central editor viewport."
      },
      {
        title: "Identify Inline Severity Markers",
        desc: "Lines flagged with vulnerabilities feature color-coded squiggly markers. Hover over any highlighted line to see the vulnerability name and detector message."
      },
      {
        title: "Jump Directly from Findings",
        desc: "Clicking 'Jump to Source Line' in any finding modal automatically scrolls Monaco and centers on the exact offending opcode or statement."
      },
      {
        title: "Inspect File Annotations Sidebar",
        desc: "Review all findings isolated to the current open file in the right-side annotations column."
      }
    ],
    proTips: [
      "The Monaco viewer is locked in secure read-only mode to prevent accidental tampering during security audits.",
      "Uses SF Mono typography with high-contrast text on Gunmetal canvas."
    ]
  },
  {
    id: "ast",
    title: "Semantic AST Tree Visualizer",
    subtitle: "Solidity Abstract Syntax Tree outline, scopes, and variable inheritance inspector",
    icon: Layers,
    badgeColor: "text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/30",
    badgeText: "AST Explorer",
    description: "Explore the structural Abstract Syntax Tree (AST) generated by the Solidity semantic visitor, breaking down contracts into functions, state variables, events, and modifiers.",
    steps: [
      {
        title: "Expand Contract Outlines",
        desc: "Click on any contract folder in the left pane to expand its declared State Variables, Functions, and Events."
      },
      {
        title: "Select Specific Code Elements",
        desc: "Click on any function or variable node (e.g. `deposit()`, `balances [mapping]`) to load its attributes into the Property Inspector."
      },
      {
        title: "Review Scope Attributes",
        desc: "Inspect visibility (`external`, `public`, `private`), state mutability (`payable`, `pure`, `view`), and source line coordinates."
      },
      {
        title: "Inspect Raw Syntax Object",
        desc: "Scroll down in the right pane to inspect the raw JSON AST syntax node for programmatic auditor validation."
      }
    ],
    proTips: [
      "State variables highlighted in Amber indicate persistent on-chain EVM storage slots.",
      "Function visibility tags help quickly spot missing access modifiers."
    ]
  },
  {
    id: "graph",
    title: "Contract Relationship Graph",
    subtitle: "Dynamic visual map of function calls, storage slots, and external attack paths",
    icon: Network,
    badgeColor: "text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/30",
    badgeText: "Live Visualizer",
    description: "A dynamic SVG node-link visualizer that renders live relationships between contracts, functions, state variables, and external exploit invocations for the active scanned contract.",
    steps: [
      {
        title: "Observe Multi-Layer Relationship Topology",
        desc: "Layer 0 (Contract) defines Layer 1 (Functions), which modify Layer 2 (Storage Slots), and may trigger Layer 3 (External Calls) to Layer 4 (Untrusted Actors)."
      },
      {
        title: "Identify Red Danger Attack Paths",
        desc: "Vulnerable functions and hazardous external calls (e.g. `msg.sender.call{value}()`) are linked by dashed Crimson Red lines, visualizing reentrancy and arbitrary call hazards."
      },
      {
        title: "Filter by Node Type or Search",
        desc: "Use the top toolbar buttons (`CONTRACT`, `FUNCTION`, `STORAGE`, `EXTERNAL_CALL`) or type in the search bar to highlight specific elements."
      },
      {
        title: "Click Nodes to Inspect Details",
        desc: "Click any node in the graph to display its live risk level, contract parent, execution attributes, and detector status in the right Inspector panel."
      },
      {
        title: "Zoom and Pan Canvas",
        desc: "Use the zoom controls (`+`, `-`, reset) to scale the canvas up to 200% for complex contract topologies."
      }
    ],
    proTips: [
      "The graph automatically updates in real-time whenever you run a new scan or switch contracts.",
      "Cyan nodes represent verified clean functions; Ruby nodes represent exploit targets."
    ]
  },
  {
    id: "findings",
    title: "Vulnerability Detection Matrix",
    subtitle: "Searchable, filterable findings catalog with remediation guidance",
    icon: ShieldAlert,
    badgeColor: "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30",
    badgeText: "Vulnerability DB",
    description: "The complete inventory of security flaws correlated across all static and symbolic analysis passes, classified by SWC registry IDs and severity standards.",
    steps: [
      {
        title: "Search & Filter by Severity",
        desc: "Filter findings by `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, or `INFORMATIONAL`, or search for terms like 'reentrancy', 'tx.origin', or 'unchecked'."
      },
      {
        title: "Click Any Row to Open Detail Modal",
        desc: "Click on any finding to open its comprehensive modal sheet containing security impact, affected code snippet, and remediation guidance."
      },
      {
        title: "Copy Remediation or Jump to Source",
        desc: "Use 'Copy Finding' to paste formatted report findings into tickets, or click 'Jump to Source Line' to immediately view the line in Monaco."
      }
    ],
    proTips: [
      "Critical findings represent direct exploit vectors that risk fund loss or contract takeover.",
      "All findings link to official SWC (Smart Contract Weakness Classification) registry specs."
    ]
  },
  {
    id: "gas",
    title: "EVM Gas & Loop Profiler",
    subtitle: "Static SSTORE storage write benchmark and unbounded loop hazard detection",
    icon: Flame,
    badgeColor: "text-[#F97316] bg-[#F97316]/10 border-[#F97316]/30",
    badgeText: "Gas Profiler",
    description: "Static analysis of expensive EVM opcodes to assist in smart contract gas optimization, storage slot caching, and block gas limit DoS prevention.",
    steps: [
      {
        title: "Examine Top Gas Metric Cards",
        desc: "Review total SSTORE storage writes (20,000 gas initial / 5,000 gas reset), external cross-contract calls, and detected unbounded loops."
      },
      {
        title: "Analyze Function Gas Benchmarks",
        desc: "Check the table for Estimated Minimum vs. Maximum gas consumption per function."
      },
      {
        title: "Audit Storage Writes & External Invocations",
        desc: "Identify functions with high write counts and consider caching repeated storage reads into memory variables."
      }
    ],
    proTips: [
      "Unbounded loops iterating over dynamic arrays risk block gas limit exhaustion.",
      "Results are statically estimated and provide upper-bound worst-case thresholds."
    ]
  },
  {
    id: "reports",
    title: "Security Audit Reports & Exports",
    subtitle: "Auditor-grade dual-tone PDF executive reports and machine-readable JSON payloads",
    icon: FileText,
    badgeColor: "text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/30",
    badgeText: "Compliance & CI/CD",
    description: "Export formal cybersecurity documentation suitable for DeFi protocol stakeholders, external human auditor hand-offs, and automated CI/CD security gating.",
    steps: [
      {
        title: "Verify Active Scan Session",
        desc: "Ensure you have executed at least one scan session from the Scanner tab."
      },
      {
        title: "Download PDF Security Audit Document",
        desc: "Click 'Download PDF Audit' to generate a dual-tone executive audit document with metadata, findings, source code snippets, and remediation instructions."
      },
      {
        title: "Export Machine-Readable JSON Payload",
        desc: "Click 'Export JSON Report' to obtain the complete structured JSON payload for GitHub Actions, GitLab CI, or DevSecOps security gates."
      }
    ],
    proTips: [
      "The PDF document includes official auditor disclaimers and SHA-256 source integrity hashes.",
      "JSON payloads adhere to standardized automated audit schema formats."
    ]
  }
];

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({
  isOpen,
  onClose,
  initialTab = "dashboard"
}) => {
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>(initialTab);
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    if (isOpen) {
      sounds.playBeep(880);
      if (initialTab) {
        setSelectedFeatureId(initialTab);
      }
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const currentGuide =
    FEATURE_GUIDES.find((g) => g.id === selectedFeatureId) || FEATURE_GUIDES[0];

  const filteredGuides = FEATURE_GUIDES.filter((g) =>
    g.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    g.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
    g.subtitle.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in duration-200">
      <div className="glass-panel-elevated rounded-2xl max-w-4xl w-full h-[94vh] sm:h-[84vh] flex flex-col overflow-hidden shadow-2xl border border-[#293B54]">
        <div className="p-3.5 sm:p-5 px-4 sm:px-7 border-b border-[#293B54] flex items-center justify-between bg-[#17202E]/40 backdrop-blur-md select-none">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold text-[#F3F6FA] tracking-tight font-mono flex items-center space-x-2">
                <span className="truncate">CONTRAX Feature Guide</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 shrink-0">
                  Help
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-[#94A3B8] mt-0.5 truncate hidden sm:block">
                Complete walkthroughs, operational steps, and auditor best practices for every workbench function.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playSubtleClick();
              onClose();
            }}
            className="text-[#94A3B8] hover:text-[#F3F6FA] p-1.5 sm:p-2 rounded-xl hover:bg-[#1E2B3D] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <div className="w-full md:w-72 bg-[#0B0F17] border-b md:border-b-0 md:border-r border-[#293B54] p-3 sm:p-4 flex flex-col justify-between select-none max-h-44 md:max-h-none shrink-0">
            <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Search features..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#111722] border border-[#293B54] rounded-xl text-xs text-[#F3F6FA] placeholder-[#94A3B8] focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="space-y-1 overflow-y-auto flex-1 pr-1">
                {filteredGuides.map((guide) => {
                  const Icon = guide.icon;
                  const isSelected = guide.id === selectedFeatureId;

                  return (
                    <button
                      key={guide.id}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedFeatureId(guide.id);
                      }}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs text-left transition-all ${
                        isSelected
                          ? "bg-[#17202E] text-[#F3F6FA] font-semibold border border-[#00E5FF]/40 shadow-sm"
                          : "text-[#CBD5E1] hover:bg-[#111722] hover:text-[#F3F6FA] border border-transparent"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-[#00E5FF]" : "text-[#94A3B8]"}`} />
                      <div className="truncate flex-1">
                        <div className="truncate">{guide.title}</div>
                        <div className="text-[10px] text-[#94A3B8] font-normal truncate">
                          {guide.badgeText}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-[#293B54] text-[11px] text-[#CBD5E1] space-y-1">
              <div className="flex items-center space-x-1.5 text-[#F3F6FA] font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Auditor Quicktip:</span>
              </div>
              <p className="text-[10px] leading-relaxed">
                Click any guide to view step-by-step guidance. Use ESC or click outside to dismiss.
              </p>
            </div>
          </div>

          <div className="flex-1 bg-transparent p-4 sm:p-7 overflow-y-auto space-y-5 sm:space-y-6">
            <div className="space-y-2 pb-5 border-b border-[#293B54]">
              <div className="flex items-center space-x-2.5">
                {React.createElement(currentGuide.icon, {
                  className: "w-6 h-6 text-[#00E5FF]"
                })}
                <h3 className="text-xl font-bold text-[#F3F6FA] tracking-tight font-mono">
                  {currentGuide.title}
                </h3>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${currentGuide.badgeColor}`}>
                  {currentGuide.badgeText}
                </span>
              </div>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                {currentGuide.description}
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider">
                STEP-BY-STEP WORKFLOW
              </div>

              <div className="space-y-2.5">
                {currentGuide.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 glass-panel rounded-xl flex items-start space-x-3.5 transition-all border border-[#293B54]"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center font-mono text-xs font-bold text-[#00E5FF] shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="space-y-1 flex-1">
                      <h4 className="text-xs font-semibold text-[#F3F6FA]">
                        {step.title}
                      </h4>
                      <p className="text-[11px] text-[#CBD5E1] leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {currentGuide.proTips && currentGuide.proTips.length > 0 && (
              <div className="p-4 bg-[#0B0F17] rounded-xl space-y-2 border border-[#00E5FF]/30">
                <div className="text-[11px] font-mono text-[#00E5FF] uppercase tracking-wider flex items-center space-x-1.5 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#00E5FF]" />
                  <span>AUDITOR BEST PRACTICES & SHORTCUTS</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[#CBD5E1]">
                  {currentGuide.proTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-[11px] leading-relaxed">
                      <span className="text-[#00E5FF] font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 px-7 border-t border-[#293B54] bg-[#17202E]/70 flex items-center justify-between text-xs select-none">
          <div className="text-[#CBD5E1] font-mono text-[11px]">
            CONTRAX Security Guidance Suite • Tactical Radar Edition
          </div>
          <button
            onClick={onClose}
            className="btn-contrax-primary px-4 py-1.5 font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer shadow-lg"
          >
            Got It, Continue Work
          </button>
        </div>
      </div>
    </div>
  );
};
