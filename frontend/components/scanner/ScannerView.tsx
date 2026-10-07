import React, { useState } from "react";
import { uploadContract, importOnchainContract, startScan } from "@/lib/api";
import { Upload, Globe, Play, FileCode, CheckCircle2, ShieldAlert, Sparkles, HelpCircle, X } from "lucide-react";
import { sounds } from "@/lib/sounds";

interface ScannerViewProps {
  projectId: string;
  onScanStarted: (scanId: string, contractId: string) => void;
  onOpenGuide?: () => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({ projectId, onScanStarted, onOpenGuide }) => {
  const [activeTab, setActiveTab] = useState<"SOURCE" | "ON_CHAIN">("SOURCE");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contractAddress, setContractAddress] = useState("");
  const [network, setNetwork] = useState("ethereum");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sampleContracts = [
    {
      name: "ReentrancyExample.sol",
      desc: "Checks-Effects-Interactions violation with external call preceding balance deduction.",
      content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ReentrancyExample {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() external {
        uint256 balance = balances[msg.sender];
        require(balance > 0, "Insufficient funds");

        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "ETH transfer failed");

        balances[msg.sender] = 0;
    }
}`
    },
    {
      name: "AccessControlExample.sol",
      desc: "tx.origin authentication flaw and missing caller authorization check.",
      content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AccessControlExample {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function transferOwnership(address newOwner) external {
        require(tx.origin == owner, "Only owner can transfer ownership");
        owner = newOwner;
    }

    function drainTreasury(address payable recipient) external {
        recipient.transfer(address(this).balance);
    }
}`
    }
  ];

  const handleSelectSample = (sample: typeof sampleContracts[0]) => {
    sounds.playClick();
    const file = new File([sample.content], sample.name, { type: "text/plain" });
    setSelectedFile(file);
    setErrorMsg(null);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    sounds.playBeep(1050);
    setIsUploading(true);
    setErrorMsg(null);
    try {
      const contract = await uploadContract(projectId, selectedFile);
      const scan = await startScan(contract.id);
      onScanStarted(scan.id, contract.id);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to process Solidity file.");
      // Automatically clear the invalid file so it does not stay selected with a valid checkmark
      setSelectedFile(null);
      const fileInput = document.getElementById("sol-file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } finally {
      setIsUploading(false);
    }
  };

  const handleOnchainImport = async () => {
    if (!contractAddress) return;
    sounds.playBeep(1050);
    setIsUploading(true);
    setErrorMsg(null);
    try {
      const contract = await importOnchainContract(projectId, contractAddress, network);
      const scan = await startScan(contract.id);
      onScanStarted(scan.id, contract.id);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to import on-chain contract.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-5 sm:space-y-7 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider mb-1 flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]"></span>
            <span>ANALYSIS WORKFLOW</span>
          </div>
          <h2 className="text-xl font-semibold text-[#F3F6FA] tracking-tight font-mono">
            Contract Vulnerability Scanner
          </h2>
          <p className="text-xs text-[#CBD5E1] mt-1 max-w-xl leading-relaxed">
            Upload smart contract source files or query on-chain bytecode across supported EVM networks.
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

      <div className="glass-panel p-1 rounded-xl flex sm:inline-flex w-full sm:w-auto border border-[#293B54]">
        <button
          onClick={() => {
            sounds.playSubtleClick();
            setActiveTab("SOURCE");
          }}
          className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2 sm:py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "SOURCE"
              ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 shadow-[0_0_12px_rgba(0,229,255,0.15)] font-semibold"
              : "text-[#94A3B8] hover:text-[#F3F6FA] border border-transparent"
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>Source Code Analysis</span>
        </button>
        <button
          onClick={() => {
            sounds.playSubtleClick();
            setActiveTab("ON_CHAIN");
          }}
          className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2 sm:py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "ON_CHAIN"
              ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 shadow-[0_0_12px_rgba(0,229,255,0.15)] font-semibold"
              : "text-[#94A3B8] hover:text-[#F3F6FA] border border-transparent"
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>On-Chain Address Audit</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-[#EF4444]/15 border border-[#EF4444]/50 text-[#FCA5A5] text-xs rounded-xl flex items-start justify-between space-x-3 shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-in fade-in duration-200">
          <div className="flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
            <div className="space-y-2">
              <div className="font-semibold text-[#FCA5A5]">{errorMsg}</div>
              <div className="text-[11px] text-[#CBD5E1]">
                CONTRAX EVM smart contracts analyze karta hai (<span className="text-[#00E5FF] font-mono font-medium">.sol</span> code). Upload ki gayi file me koi Solidity contract nahi mila. Test karne ke liye demo contract load karein:
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => handleSelectSample(sampleContracts[0])}
                  className="px-3 py-1 bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 border border-[#00E5FF]/50 text-[#00E5FF] text-[11px] font-semibold rounded-lg cursor-pointer transition-all inline-flex items-center space-x-1.5 shadow-[0_0_8px_rgba(0,229,255,0.15)]"
                >
                  <Sparkles className="w-3 h-3 text-[#00E5FF]" />
                  <span>⚡ Load "ReentrancyExample.sol" Demo Contract</span>
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="p-1.5 hover:bg-[#EF4444]/20 rounded-lg text-[#FCA5A5] hover:text-[#FFFFFF] transition-colors shrink-0 cursor-pointer"
            title="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {activeTab === "SOURCE" && (
        <div className="space-y-5">
          <div className="glass-panel p-5 sm:p-8 rounded-2xl space-y-5 sm:space-y-6 border border-[#293B54]">
            <div className="crystal-placeholder crystal-facet rounded-2xl p-6 sm:p-10 text-center transition-all border border-[#293B54] hover:border-[#00E5FF]/40">
              <div className="w-12 h-12 rounded-2xl crystal-panel flex items-center justify-center mx-auto mb-3 text-[#00E5FF] border border-[#293B54]">
                <Upload className="w-5 h-5 text-[#00E5FF]" />
              </div>
              <div className="text-xs font-semibold text-[#F3F6FA]">
                Drop Solidity contract (<span className="font-mono text-[#00E5FF]">.sol</span>) or project archive (<span className="font-mono text-[#00E5FF]">.zip</span>)
              </div>
              <div className="text-[11px] text-[#94A3B8] mt-1.5 max-w-sm mx-auto">
                Automatic compilation pragma detection, AST visitor parsing, and multi-analyzer dispatch.
              </div>
              
              <input
                type="file"
                accept=".sol,.zip"
                id="sol-file-input"
                className="hidden"
                onChange={(e) => {
                  setSelectedFile(e.target.files?.[0] || null);
                  setErrorMsg(null);
                }}
              />
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <label
                  htmlFor="sol-file-input"
                  className="px-4 py-2 bg-[#17202E] hover:bg-[#1E293B] border border-[#293B54] hover:border-[#00E5FF]/60 text-[#F3F6FA] text-xs font-semibold rounded-lg cursor-pointer transition-all shadow-sm"
                >
                  Browse Local Files
                </label>

                <button
                  type="button"
                  onClick={() => handleSelectSample(sampleContracts[0])}
                  className="px-4 py-2 bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center space-x-1.5 shadow-[0_0_12px_rgba(0,229,255,0.15)]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>⚡ Try Demo Contract</span>
                </button>

                {selectedFile && (
                  <div className="p-2 bg-[#00E5FF]/10 border border-[#00E5FF]/40 rounded-lg inline-flex items-center space-x-2 text-xs font-mono text-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.1)]">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00E5FF]" />
                    <span className="font-medium text-[#F3F6FA] truncate max-w-[220px]">{selectedFile.name}</span>
                    <span className="text-[#94A3B8]">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playSubtleClick();
                        setSelectedFile(null);
                        setErrorMsg(null);
                        const fileInput = document.getElementById("sol-file-input") as HTMLInputElement;
                        if (fileInput) fileInput.value = "";
                      }}
                      className="p-1 hover:bg-[#EF4444]/20 rounded text-[#94A3B8] hover:text-[#EF4444] transition-colors ml-1 cursor-pointer"
                      title="Remove selected file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleFileUpload}
              disabled={!selectedFile || isUploading}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                !selectedFile || isUploading
                  ? "bg-[#17202E] text-[#94A3B8] cursor-not-allowed border border-[#293B54]"
                  : "btn-contrax-primary active:scale-95 cursor-pointer shadow-lg"
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isUploading ? "Dispatching Analyzer Sandbox..." : "Run Security Scan"}</span>
            </button>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-[#293B54]/70">
            <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-3 flex items-center space-x-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>TEST FIXTURES (INTENTIONALLY VULNERABLE)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sampleContracts.map((sample) => (
                <div
                  key={sample.name}
                  onClick={() => handleSelectSample(sample)}
                  className="p-4 crystal-card crystal-facet rounded-xl cursor-pointer transition-all flex flex-col justify-between border border-[#293B54] hover:border-[#00E5FF]/40"
                >
                  <div>
                    <div className="font-mono text-xs font-bold text-[#F3F6FA]">
                      {sample.name}
                    </div>
                    <div className="text-[11px] text-[#CBD5E1] mt-1 leading-snug">
                      {sample.desc}
                    </div>
                  </div>
                  <div className="text-[10px] text-[#00E5FF] font-semibold mt-3 flex items-center space-x-1 font-mono">
                    <span>Load fixture &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "ON_CHAIN" && (
        <div className="glass-panel p-8 rounded-2xl space-y-6 border border-[#293B54]">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5 font-mono">
                Contract Address (0x...)
              </label>
              <input
                type="text"
                placeholder="0x1234567890abcdef1234567890abcdef12345678"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value.trim())}
                className="w-full bg-[#0B0F17] border border-[#293B54] focus:border-[#00E5FF] focus:outline-none px-3.5 py-2.5 text-xs font-mono text-[#F3F6FA] rounded-xl placeholder-[#94A3B8]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5 font-mono">
                EVM Network Target
              </label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className="w-full bg-[#0B0F17] border border-[#293B54] focus:border-[#00E5FF] focus:outline-none px-3.5 py-2.5 text-xs text-[#F3F6FA] rounded-xl cursor-pointer"
              >
                <option value="ethereum">Ethereum Mainnet</option>
                <option value="sepolia">Sepolia Testnet</option>
                <option value="polygon">Polygon PoS</option>
                <option value="arbitrum">Arbitrum One</option>
                <option value="optimism">Optimism Mainnet</option>
                <option value="base">Base Mainnet</option>
              </select>
            </div>

            <div className="p-4 bg-[#0B0F17] border border-[#293B54] rounded-xl text-[11px] text-[#CBD5E1] space-y-1">
              <div className="font-semibold text-[#F3F6FA]">Important On-Chain Analysis Disclaimer:</div>
              <div>
                If verified source code is unavailable on the network explorer, analysis is limited to available contract bytecode and metadata.
              </div>
            </div>
          </div>

          <button
            onClick={handleOnchainImport}
            disabled={!contractAddress || isUploading}
            className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              !contractAddress || isUploading
                ? "bg-[#17202E] text-[#94A3B8] cursor-not-allowed border border-[#293B54]"
                : "btn-contrax-primary active:scale-95 cursor-pointer shadow-lg"
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isUploading ? "Querying RPC & Dispatching..." : "Analyze On-Chain Contract"}</span>
          </button>
        </div>
      )}
    </div>
  );
};
