"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { ScannerView } from "@/components/scanner/ScannerView";
import { RealtimeScanProgress } from "@/components/scanner/RealtimeScanProgress";
import { FindingsList } from "@/components/findings/FindingsList";
import { FindingDetailModal } from "@/components/findings/FindingDetailModal";
import { MonacoSourceViewer } from "@/components/editor/MonacoSourceViewer";
import { ASTVisualizer } from "@/components/ast/ASTVisualizer";
import { ContractGraph } from "@/components/contract-graph/ContractGraph";
import { GasProfiler } from "@/components/charts/GasProfiler";
import { ReportsView } from "@/components/ui/ReportsView";
import { HowToUseModal } from "@/components/ui/HowToUseModal";

import { 
  fetchProjects, 
  createProject, 
  fetchScans,
  fetchAllFindings,
  getGasAnalysis, 
  getContractAST 
} from "@/lib/api";
import { Finding, ScanStatus, SourceFile, GasAnalysisItem } from "@/types/contract";
import { Plus, HelpCircle, Menu, Volume2, VolumeX } from "lucide-react";
import { sounds } from "@/lib/sounds";

export default function Home() {
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [projectId, setProjectId] = useState<string>("");
  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const [activeContractId, setActiveContractId] = useState<string | null>(null);

  const [isAudioMuted, setIsAudioMuted] = useState(false);

  useEffect(() => {
    setIsAudioMuted(sounds.getMuted());
    const unsubscribe = sounds.subscribe((muted) => setIsAudioMuted(muted));
    
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam) {
        setCurrentTab(tabParam);
      }
    }

    return () => unsubscribe();
  }, []);

  const [scans, setScans] = useState<ScanStatus[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [gasData, setGasData] = useState<GasAnalysisItem[]>([]);
  const [astData, setAstData] = useState<any>(null);
  const [sourceFiles, setSourceFiles] = useState<SourceFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("ReentrancyExample.sol");
  const [targetLine, setTargetLine] = useState<number | undefined>(undefined);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guideTab, setGuideTab] = useState<string>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenGuide = (tab?: string) => {
    sounds.playClick();
    setGuideTab(tab || currentTab);
    setIsGuideOpen(true);
  };

  const handleNavigateTab = (tab: string) => {
    sounds.playClick();
    setCurrentTab(tab);
  };

  useEffect(() => {
    async function initWorkspace() {
      try {
        const projects = await fetchProjects();
        if (projects && projects.length > 0) {
          setProjectId(projects[0].id);
        } else {
          const newProj = await createProject("Contrax Security Workspace", "Primary smart contract audit project");
          setProjectId(newProj.id);
        }

        const existingScans = await fetchScans();
        if (existingScans && existingScans.length > 0) {
          setScans(existingScans);
          const latestScan = existingScans[0];
          setActiveScanId(latestScan.id);
          setActiveContractId(latestScan.contract_id);

          try {
            const gas = await getGasAnalysis(latestScan.id);
            setGasData(gas);
            const ast = await getContractAST(latestScan.contract_id);
            setAstData(ast);

            const cRes = await fetch(`http://127.0.0.1:8000/api/v1/contracts/${latestScan.contract_id}`);
            if (cRes.ok) {
              const cData = await cRes.json();
              if (cData.source_files && cData.source_files.length > 0) {
                setSourceFiles(cData.source_files);
                setSelectedFile(cData.source_files[0].file_path);
              }
            }
          } catch (e) {
            console.error("Error preloading scan artifacts:", e);
          }
        }

        const existingFindings = await fetchAllFindings();
        if (existingFindings && existingFindings.length > 0) {
          setFindings(existingFindings);
          if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.get("finding")) {
              setSelectedFinding(existingFindings[0]);
            }
            if (params.get("guide")) {
              setIsGuideOpen(true);
            }
          }
        }
      } catch (err) {
        console.error("Workspace init error:", err);
      }
    }
    initWorkspace();
  }, []);

  const handleScanStarted = async (scanId: string, contractId: string) => {
    sounds.playBeep(980);
    setActiveScanId(scanId);
    setActiveContractId(contractId);
    setIsScanning(true);
    setCurrentTab("scanner");

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/contracts/${contractId}`);
      if (res.ok) {
        const cData = await res.json();
        if (cData.source_files && cData.source_files.length > 0) {
          setSourceFiles(cData.source_files);
          setSelectedFile(cData.source_files[0].file_path);
        }
      }
    } catch (e) {
      console.error("Contract source load error:", e);
    }
  };

  const handleScanComplete = async (completedFindings: Finding[]) => {
    setIsScanning(false);
    setFindings(completedFindings);

    const hasCritical = completedFindings.some(
      (f) => f.severity === "CRITICAL" || f.severity === "HIGH"
    );
    if (hasCritical) {
      sounds.playAlertBeep();
    } else {
      sounds.playSuccessChime();
    }

    if (activeScanId) {
      try {
        const gas = await getGasAnalysis(activeScanId);
        setGasData(gas);
      } catch (e) {
        console.error("Gas fetch error:", e);
      }
    }

    if (activeContractId) {
      try {
        const ast = await getContractAST(activeContractId);
        setAstData(ast);
      } catch (e) {
        console.error("AST fetch error:", e);
      }
    }

    const refreshedScans = await fetchScans();
    if (refreshedScans && refreshedScans.length > 0) {
      setScans(refreshedScans);
    }

    setCurrentTab("findings");
  };

  const handleJumpToSource = (filePath: string, line?: number) => {
    sounds.playClick();
    setSelectedFile(filePath);
    setTargetLine(line);
    setCurrentTab("source-viewer");
  };

  const tabLabels: Record<string, string> = {
    dashboard: "Overview",
    scanner: "Vulnerability Scanner",
    "source-viewer": "Source & Monaco",
    ast: "AST Visualizer",
    graph: "Contract Relationship Graph",
    findings: "Findings",
    gas: "Gas & Loops",
    reports: "Audit Reports",
  };

  return (
    <div className="flex h-screen bg-[#0B0E14] text-[#F3F6FA] overflow-hidden antialiased relative">
      <Sidebar 
        currentTab={currentTab} 
        onSelectTab={handleNavigateTab}
        findingsCount={findings.length}
        scansCount={scans.length}
        onOpenGuide={() => handleOpenGuide(currentTab)}
        isOpen={isMobileMenuOpen}
        onClose={() => {
          sounds.playSubtleClick();
          setIsMobileMenuOpen(false);
        }}
      />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-transparent relative z-10 w-full min-w-0">
        <header className="h-14 glass-header px-4 sm:px-8 flex items-center justify-between select-none sticky top-0 z-40">
          <div className="flex items-center space-x-2 sm:space-x-2.5 text-xs min-w-0">
            <button
              onClick={() => {
                sounds.playClick();
                setIsMobileMenuOpen(true);
              }}
              className="p-1.5 -ml-1 text-[#94A3B8] hover:text-[#F3F6FA] hover:bg-[#17202E] rounded-xl md:hidden transition-colors"
              title="Open Navigation Drawer"
            >
              <Menu className="w-5 h-5 text-[#00E5FF]" />
            </button>

            <div className="flex items-center space-x-1.5 shrink-0">
              <img src="/logo_mark.png" alt="CONTRAX" className="w-5 h-5 object-contain drop-shadow-[0_0_6px_rgba(255,103,31,0.4)]" />
              <span className="font-bold tracking-tight font-mono bg-gradient-to-r from-[#FF671F] via-[#FFFFFF] to-[#22C55E] bg-clip-text text-transparent">CONTRAX</span>
            </div>
            <span className="text-[#1F2B3E] hidden sm:inline">/</span>
            <span className="text-[#94A3B8] hidden sm:inline truncate max-w-[140px] md:max-w-none text-xs">Security Console</span>
            <span className="text-[#1F2B3E]">/</span>
            <span className="px-2 py-0.5 rounded-md glass-pill text-[#F3F6FA] font-mono text-[11px] font-medium truncate max-w-[120px] sm:max-w-none border border-[#1F2B3E]">
              {tabLabels[currentTab] || "Overview"}
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <div className="hidden lg:flex items-center space-x-2.5 px-3 py-1 glass-pill rounded-xl text-[11px] font-mono border border-[#1F2B3E]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]"></span>
              </span>
              <span className="text-[#94A3B8]">Engines:</span>
              <span className="text-[#00E5FF] font-semibold">Armed & Ready</span>
            </div>

            <button
              onClick={() => {
                const nextMuted = sounds.toggleMute();
                setIsAudioMuted(nextMuted);
              }}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 glass-panel hover:bg-[#17202E] text-[#F3F6FA] rounded-xl text-xs font-medium transition-all border border-[#1F2B3E]"
              title={isAudioMuted ? "Sound Effects Muted (Click to Unmute)" : "Sound Effects Active (Click to Mute)"}
            >
              {isAudioMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-[#EF4444]" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-[#00E5FF]" />
              )}
              <span className="hidden md:inline text-[11px] font-mono">
                {isAudioMuted ? "Muted" : "Audio"}
              </span>
            </button>

            <button
              onClick={() => handleOpenGuide(currentTab)}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 glass-panel hover:bg-[#17202E] hover:border-[#00E5FF]/40 text-[#F3F6FA] rounded-xl text-xs font-medium transition-all group border border-[#1F2B3E]"
              title="Open Feature Guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#00E5FF] group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">How to Use</span>
              <span className="sm:hidden text-[11px]">Guide</span>
            </button>

            <button
              onClick={() => {
                sounds.playBeep(1100);
                setCurrentTab("scanner");
              }}
              className="flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 bg-gradient-to-r from-cyan-400 via-cyan-300 to-amber-300 hover:from-cyan-300 hover:to-amber-200 text-[#0B0E14] rounded-xl text-xs font-bold transition-all shadow-[0_2px_12px_rgba(0,229,255,0.25)] hover:shadow-[0_4px_18px_rgba(0,229,255,0.45)] active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-[#0B0E14] stroke-[2.5]" />
              <span className="hidden sm:inline">New Scan</span>
              <span className="sm:hidden text-[11px]">Scan</span>
            </button>
          </div>
        </header>

        <div className="flex-1">
          {currentTab === "dashboard" && (
            <DashboardOverview
              scans={scans}
              findings={findings}
              onOpenScanner={() => setCurrentTab("scanner")}
              onSelectFinding={setSelectedFinding}
              onNavigateTab={setCurrentTab}
              onOpenGuide={handleOpenGuide}
            />
          )}

          {currentTab === "scanner" && (
            <div>
              {isScanning && activeScanId ? (
                <RealtimeScanProgress
                  scanId={activeScanId}
                  onScanComplete={handleScanComplete}
                />
              ) : (
                <ScannerView
                  projectId={projectId}
                  onScanStarted={handleScanStarted}
                  onOpenGuide={() => handleOpenGuide("scanner")}
                />
              )}
            </div>
          )}

          {currentTab === "findings" && (
            <FindingsList
              findings={findings}
              onSelectFinding={setSelectedFinding}
              onOpenGuide={() => handleOpenGuide("findings")}
            />
          )}

          {currentTab === "source-viewer" && (
            <MonacoSourceViewer
              files={
                sourceFiles.length > 0
                  ? sourceFiles
                  : [
                      {
                        id: "default",
                        file_path: "ReentrancyExample.sol",
                        content: `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\n/**\n * @title ReentrancyExample\n * @notice Vulnerable to Checks-Effects-Interactions violation\n */\ncontract ReentrancyExample {\n    mapping(address => uint256) public balances;\n\n    event Deposited(address indexed sender, uint256 amount);\n    event Withdrawn(address indexed to, uint256 amount);\n\n    function deposit() external payable {\n        balances[msg.sender] += msg.value;\n        emit Deposited(msg.sender, msg.value);\n    }\n\n    function withdraw() external {\n        uint256 balance = balances[msg.sender];\n        require(balance > 0, "Insufficient funds");\n\n        // VULNERABILITY: External call before state variable zeroed out\n        (bool success, ) = msg.sender.call{value: balance}("");\n        require(success, "ETH transfer failed");\n\n        balances[msg.sender] = 0;\n        emit Withdrawn(msg.sender, balance);\n    }\n}`,
                        file_size: 780,
                        sha256_hash: "default_hash",
                        created_at: new Date().toISOString(),
                      },
                    ]
              }
              selectedFile={selectedFile}
              onSelectFile={setSelectedFile}
              targetLine={targetLine}
              findings={findings}
              onOpenGuide={() => handleOpenGuide("source-viewer")}
            />
          )}

          {currentTab === "ast" && (
            <ASTVisualizer
              astData={
                astData || {
                  contracts: [
                    {
                      name: "ReentrancyExample",
                      type: "contract",
                      stateVariables: [
                        { name: "balances", type: "mapping(address => uint256)", line: 10 },
                      ],
                      functions: [
                        { name: "deposit", visibility: "external", line: 15 },
                        { name: "withdraw", visibility: "external", line: 20 },
                      ],
                      events: [
                        { name: "Deposited", params: "address indexed sender, uint256 amount", line: 12 },
                        { name: "Withdrawn", params: "address indexed to, uint256 amount", line: 13 },
                      ],
                    },
                  ],
                }
              }
              onOpenGuide={() => handleOpenGuide("ast")}
            />
          )}

          {currentTab === "graph" && (
            <ContractGraph
              astData={astData}
              findings={findings}
              contractName={selectedFile}
              sourceFiles={sourceFiles}
              onOpenGuide={() => handleOpenGuide("graph")}
            />
          )}

          {currentTab === "gas" && (
            <GasProfiler 
              gasData={gasData} 
              onOpenGuide={() => handleOpenGuide("gas")} 
            />
          )}

          {currentTab === "reports" && (
            <ReportsView 
              currentScanId={activeScanId} 
              onOpenGuide={() => handleOpenGuide("reports")} 
            />
          )}
        </div>
      </main>

      {selectedFinding && (
        <FindingDetailModal
          finding={selectedFinding}
          onClose={() => setSelectedFinding(null)}
          onJumpToSource={handleJumpToSource}
        />
      )}

      <HowToUseModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        initialTab={guideTab}
      />
    </div>
  );
}
