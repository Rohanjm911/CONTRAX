module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#09090F",
        secondary: "#F3F4F6",
        ivory: "#F3F4F6",
        ivoryMuted: "#94A3B8",
        
        // Deep Midnight Void & Surfaces
        deepMidnight: "#09090F",
        midnightSurface: "#0E0E18",
        midnightElevated: "#151426",
        midnightActive: "#1A1830",
        midnightBorder: "#201F38",
        midnightBorderLight: "#2E2D4E",
        midnightMuted: "#64748B",

        // Cyberpunk Violet & Electric Purple Palette
        cyberViolet: "#8B5CF6",
        electricPurple: "#A855F7",
        neonPurple: "#C084FC",
        neonCyan: "#00E5FF",
        laserCyan: "#06B6D4",

        // Backwards-compatible aliases
        deepNavy: "#09090F",
        navySurface: "#0E0E18",
        navyElevated: "#151426",
        navyActive: "#1A1830",
        navyBorder: "#201F38",
        navyBorderLight: "#2E2D4E",
        navyMuted: "#64748B",
        cyberCyan: "#A855F7",
        ruby: "#EF4444",
        crimson: "#EF4444",
        
        critical: "#EF4444",
        high: "#F97316",
        medium: "#F59E0B",
        low: "#8B5CF6",
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
