import React from "react";

interface ContraxLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  subtitle?: string;
  animated?: boolean;
}

export const ContraxLogo: React.FC<ContraxLogoProps> = ({
  className = "",
  size = 32,
  showText = false,
  subtitle,
  animated = true,
}) => {
  return (
    <div className={`inline-flex items-center space-x-3 group select-none ${className}`}>
      <div className="relative flex-shrink-0 transition-transform duration-300 ease-out group-hover:scale-105">
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          shapeRendering="geometricPrecision"
          textRendering="geometricPrecision"
          className="transition-all duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_0_16px_rgba(0,229,255,0.45)]"
        >
          <defs>
            <linearGradient id="shieldRimGrad" x1="24" y1="12" x2="76" y2="88" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>

            <linearGradient id="cyanShieldGrad" x1="30" y1="20" x2="70" y2="78" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            <radialGradient id="shieldAmbientFill" cx="50" cy="45" r="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.14" />
              <stop offset="70%" stopColor="#111722" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#0B0E14" stopOpacity="0.96" />
            </radialGradient>

            <linearGradient id="facetLeftGrad" x1="38" y1="27" x2="50" y2="47" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.08" />
            </linearGradient>

            <linearGradient id="facetRightGrad" x1="50" y1="27" x2="62" y2="47" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.04" />
            </linearGradient>

            <filter id="crimsonBeaconGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d="M50 12 L76 23 C76 52 50 82 50 88 C50 82 24 52 24 23 Z"
            fill="url(#shieldAmbientFill)"
          />

          <path
            d="M50 12 L76 23 C76 52 50 82 50 88 C50 82 24 52 24 23 Z"
            stroke="url(#shieldRimGrad)"
            strokeWidth="3.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          <path
            d="M50 20 L70 29 C70 50 50 74 50 78 C50 74 30 50 30 29 Z"
            stroke="url(#cyanShieldGrad)"
            strokeWidth="2.4"
            strokeLinejoin="round"
            strokeOpacity="0.95"
          />

          <line x1="16" y1="54" x2="33" y2="52" stroke="#F3F6FA" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.85" />
          <circle cx="16" cy="54" r="4" fill="#0B0E14" stroke="#F3F6FA" strokeWidth="2.4" />
          <circle cx="16" cy="54" r="1.5" fill="#00E5FF" />

          <line x1="84" y1="36" x2="68" y2="40" stroke="#F3F6FA" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.85" />
          <circle cx="84" cy="36" r="4" fill="#0B0E14" stroke="#F3F6FA" strokeWidth="2.4" />
          <circle cx="84" cy="36" r="1.5" fill="#00E5FF" />

          <line x1="83" y1="64" x2="68" y2="55" stroke="#F3F6FA" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.85" />
          <circle cx="83" cy="64" r="4" fill="#0B0E14" stroke="#F3F6FA" strokeWidth="2.4" />
          <circle cx="83" cy="64" r="1.5" fill="#00E5FF" />

          <polygon points="50,27 38,47 50,42" fill="url(#facetLeftGrad)" stroke="#F3F6FA" strokeWidth="2.2" strokeLinejoin="round" />
          <polygon points="50,27 62,47 50,42" fill="url(#facetRightGrad)" stroke="#F3F6FA" strokeWidth="2.2" strokeLinejoin="round" />
          <polygon points="38,47 50,42 62,47" fill="#F3F6FA" fillOpacity="0.08" stroke="#F3F6FA" strokeWidth="1.8" strokeLinejoin="round" />

          <polygon points="39,52 50,68 50,56" fill="url(#facetLeftGrad)" stroke="#F3F6FA" strokeWidth="2.2" strokeLinejoin="round" />
          <polygon points="61,52 50,68 50,56" fill="url(#facetRightGrad)" stroke="#F3F6FA" strokeWidth="2.2" strokeLinejoin="round" />

          {animated && (
            <>
              <circle cx="68" cy="45" r="3" fill="none" stroke="#EF4444" strokeWidth="1.2">
                <animate attributeName="r" values="3;9;15" dur="2.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0.35;0" dur="2.2s" repeatCount="indefinite" />
              </circle>
              <circle cx="68" cy="45" r="3" fill="none" stroke="#00E5FF" strokeWidth="0.8">
                <animate attributeName="r" values="3;7;13" dur="2.2s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.75;0.25;0" dur="2.2s" begin="0.8s" repeatCount="indefinite" />
              </circle>
            </>
          )}

          <circle cx="68" cy="45" r="3.2" fill="#EF4444" filter="url(#crimsonBeaconGlow)" />
          <circle cx="68" cy="45" r="1.2" fill="#FFFFFF" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="font-bold tracking-[0.16em] text-base text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] via-[#F3F6FA] to-[#94A3B8] font-mono leading-none">
              CONTRAX
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
              Radar
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider mt-0.5">
            {subtitle || "Tactical Telemetry"}
          </span>
        </div>
      )}
    </div>
  );
};
