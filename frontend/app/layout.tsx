import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "CONTRAX | Smart Contract Security Scanner",
  description: "Automated vulnerability scanner and audit visualizer for Solidity smart contracts. See the flaw before they do.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo_mark.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/logo_mark.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#09090F",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#09090F] text-[#F3F4F6] min-h-screen relative antialiased selection:bg-[#8B5CF6]/30 selection:text-[#E9D5FF]">
        <div 
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          style={{
            background: "radial-gradient(ellipse 85% 55% at 50% -20%, rgba(139, 92, 246, 0.22), transparent 70%), radial-gradient(circle at 92% 18%, rgba(6, 182, 212, 0.12), transparent 45%), radial-gradient(circle at 6% 75%, rgba(168, 85, 247, 0.12), transparent 50%), radial-gradient(circle at 85% 85%, rgba(124, 58, 237, 0.08), transparent 45%)"
          }}
        />
        <div className="relative z-10 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
