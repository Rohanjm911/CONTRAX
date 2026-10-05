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
          className="w-auto max-w-full object-contain transition-all duration-300 drop-shadow-[0_2px_12px_rgba(255,103,31,0.25)] group-hover:drop-shadow-[0_0_20px_rgba(34,197,94,0.45)] group-hover:scale-[1.02]"
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
            className="object-contain transition-all duration-300 drop-shadow-[0_2px_10px_rgba(255,103,31,0.35)] group-hover:drop-shadow-[0_0_16px_rgba(34,197,94,0.55)]"
          />
          {animated && (
            <span
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75"
              style={{ animationDuration: "3s" }}
            />
          )}
        </div>
      </div>

      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center space-x-2">
            <span className="font-bold tracking-[0.16em] text-base font-mono leading-none bg-gradient-to-r from-[#FF671F] via-[#FFFFFF] to-[#22C55E] bg-clip-text text-transparent">
              CONTRAX
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
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
