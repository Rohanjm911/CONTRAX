import React from "react";

interface ContraxLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  subtitle?: string;
  animated?: boolean;
  variant?: "mark" | "full";
}

export const ContraxLogo: React.FC<ContraxLogoProps> = ({
  className = "",
  size = 36,
  showText = false,
  subtitle,
  animated = true,
  variant = "mark",
}) => {
  if (variant === "full") {
    return (
      <div className={`inline-flex items-center group select-none ${className}`}>
        <img
          src="/logo_full.png"
          alt="CONTRAX - Cybersecurity Analysis Workbench"
          style={{ height: size ? `${size}px` : "40px" }}
          className="w-auto max-w-full object-contain transition-all duration-300 drop-shadow-[0_2px_12px_rgba(168,85,247,0.35)] group-hover:drop-shadow-[0_0_20px_rgba(0,229,255,0.5)] group-hover:scale-[1.02]"
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-3 group select-none ${className}`}>
      <div className={`relative flex-shrink-0 transition-transform duration-300 ease-out group-hover:scale-105 ${animated ? "hover:rotate-1" : ""}`}>
        <div className="relative">
          <img
            src="/logo_mark.png"
            alt="CONTRAX Emblem"
            width={size}
            height={size}
            style={{ width: `${size}px`, height: `${size}px` }}
            className="object-contain transition-all duration-300 drop-shadow-[0_2px_10px_rgba(168,85,247,0.4)] group-hover:drop-shadow-[0_0_18px_rgba(0,229,255,0.6)]"
          />
          {animated && (
            <span
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#A855F7] animate-ping opacity-75 shadow-[0_0_6px_#A855F7]"
              style={{ animationDuration: "2.8s" }}
            />
          )}
        </div>
      </div>

      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center space-x-2">
            <span className="font-bold tracking-[0.16em] text-base font-mono leading-none bg-gradient-to-r from-[#C084FC] via-[#F3F4F6] to-[#00E5FF] bg-clip-text text-transparent">
              CONTRAX
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#8B5CF6]/15 text-[#C084FC] border border-[#8B5CF6]/35 uppercase tracking-wider">
              Workbench
            </span>
          </div>
          <span className="text-[9.5px] font-mono text-[#94A3B8] uppercase tracking-wider mt-0.5">
            {subtitle || "Cybersecurity Workbench"}
          </span>
        </div>
      )}
    </div>
  );
};
