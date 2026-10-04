module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0B0E14",
        secondary: "#F3F6FA",
        ivory: "#F3F6FA",
        ivoryMuted: "#94A3B8",
        
        deepNavy: "#0B0E14",
        navySurface: "#111722",
        navyElevated: "#17202E",
        navyActive: "#1E2B3D",
        navyBorder: "#1F2B3E",
        navyBorderLight: "#293B54",
        navyMuted: "#64748B",

        cyberCyan: "#00E5FF",
        cyan: "#00E5FF",
        amber: "#F59E0B",
        ruby: "#EF4444",
        crimson: "#EF4444",
        emerald: "#00E5FF",
        
        critical: "#EF4444",
        high: "#F97316",
        medium: "#F59E0B",
        low: "#00E5FF",
        informational: "#64748B"
      },
      borderRadius: {
        'apple-sm': '6px',
        'apple-md': '10px',
        'apple-lg': '12px',
        'apple-xl': '16px',
        'apple-2xl': '20px',
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Inter',
          'Arial',
          'sans-serif'
        ],
        mono: [
          '"Cascadia Code"',
          'Consolas',
          '"JetBrains Mono"',
          '"Fira Code"',
          '"SF Mono"',
          'Menlo',
          'Monaco',
          'monospace'
        ]
      }
    },
  },
  plugins: [],
}
