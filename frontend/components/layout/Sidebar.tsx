import React from "react";
import { 
  ShieldAlert, 
  Layers, 
  FileCode2, 
  Activity, 
  FileText, 
  Flame, 
  Terminal,
  Network,
  HelpCircle,
  X
} from "lucide-react";
import { ContraxLogo } from "@/components/ui/ContraxLogo";
import { sounds } from "@/lib/sounds";

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  findingsCount?: number;
  scansCount?: number;
  onOpenGuide?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  onSelectTab,
  findingsCount = 0,
  scansCount = 0,
  onOpenGuide,
  isOpen = false,
  onClose
}) => {
  const navigationSections = [
    {
      title: "OPERATIONS",
      items: [
        { id: "dashboard", label: "Overview", icon: Activity, count: null },
        { id: "scanner", label: "Vulnerability Scanner", icon: Terminal, count: null },
      ]
    },
    {
      title: "INSPECTION",
      items: [
        { id: "source-viewer", label: "Source & Monaco", icon: FileCode2, count: null },
        { id: "ast", label: "AST Visualizer", icon: Layers, count: null },
        { id: "graph", label: "Contract Graph", icon: Network, count: null },
      ]
    },
    {
      title: "SECURITY AUDIT",
      items: [
        { id: "findings", label: "Findings", icon: ShieldAlert, count: findingsCount > 0 ? findingsCount : null },
        { id: "gas", label: "Gas & Loops", icon: Flame, count: null },
        { id: "reports", label: "Audit Reports", icon: FileText, count: null },
      ]
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full select-none overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-5 border-b border-[#201F38] flex items-center justify-between">
          <ContraxLogo size={38} showText={true} subtitle="Smart Contract Audit" />

          {onClose && (
            <button
              onClick={() => {
                sounds.playSubtleClick();
                onClose();
              }}
              className="p-1.5 text-[#94A3B8] hover:text-[#F3F6FA] hover:bg-[#151426] rounded-xl md:hidden transition-colors"
              title="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-3 space-y-4">
          {navigationSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 text-[10px] font-bold tracking-wider text-[#94A3B8] uppercase font-sans flex items-center space-x-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] shadow-[0_0_4px_#A855F7]"></span>
                <span>{section.title}</span>
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        sounds.playClick();
                        onSelectTab(item.id);
                        onClose?.();
                      }}
                      className={`relative w-full flex items-center justify-between pl-3.5 pr-3 py-2.5 md:py-2.5 rounded-xl text-xs font-medium transition-all duration-200 text-left group neu-nav-item ${
                        isActive
                          ? "neu-nav-item-active text-[#FFFFFF] font-semibold"
                          : "text-[#CBD5E1] hover:text-[#FFFFFF] hover:bg-[#151426]/70 border border-transparent hover:border-[rgba(255,255,255,0.06)] hover:shadow-[3px_3px_8px_rgba(0,0,0,0.5),-2px_-2px_6px_rgba(255,255,255,0.02)]"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-1.5 top-2.5 bottom-2.5 w-1 bg-[#A855F7] rounded-full shadow-[0_0_10px_#A855F7]" />
                      )}

                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-4 h-4 transition-colors ${
                          isActive 
                            ? "text-[#C084FC] drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]" 
                            : "text-[#94A3B8] group-hover:text-[#FFFFFF]"
                        }`} />
                        <span className="tracking-tight">{item.label}</span>
                      </div>

                      {item.count !== null && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
                          isActive 
                            ? "bg-[#EF4444] text-[#FFFFFF] shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
                            : "bg-[#2A0E13] text-[#EF4444] border border-[#5C1D24] group-hover:border-[#EF4444]/60"
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {onOpenGuide && (
          <div className="p-3 pt-0">
            <button
              onClick={() => {
                sounds.playClick();
                onOpenGuide();
                onClose?.();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#F3F6FA] neu-button group cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-3.5 h-3.5 text-[#A855F7] group-hover:rotate-12 transition-transform" />
                <span>How to Use</span>
              </div>
              <span className="text-[10px] font-mono text-[#CBD5E1] px-2 py-0.5 rounded-lg bg-[#09090F] border border-[#201F38] group-hover:text-[#C084FC] group-hover:border-[#A855F7]/40 transition-colors shadow-inner">
                Guide
              </span>
            </button>
          </div>
        )}
      </div>

      <div className="p-3.5 border-t border-[#201F38] bg-[#09090F] shrink-0">
        <div className="neu-inset p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A855F7] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#A855F7] shadow-[0_0_8px_#A855F7]"></span>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-[#F3F6FA] leading-tight">Analysis Sandbox</div>
              <div className="text-[10px] font-mono text-[#94A3B8]">Zero-Trust • Isolated</div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#C084FC] px-2 py-0.5 bg-[#8B5CF6]/15 rounded-md border border-[#8B5CF6]/35 font-semibold shadow-sm">
            v1.0
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="w-64 glass-sidebar hidden md:flex flex-col justify-between h-screen select-none relative z-20 shrink-0">
        {sidebarContent}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 animate-in fade-in duration-200"
            onClick={onClose}
          />
          <aside className="relative w-72 max-w-[82vw] glass-sidebar flex flex-col justify-between h-screen select-none z-50 animate-in slide-in-from-left duration-250 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
