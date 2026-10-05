import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "CONTRAX | Smart Contract Security Scanner",
  description: "Automated vulnerability scanner and audit visualizer for Solidity smart contracts. See the flaw before they do.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0B0E14",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0E14] text-[#F3F6FA] min-h-screen relative antialiased selection:bg-[#1E2B3D] selection:text-[#00E5FF]">
        <div 
          className="fixed inset-0 pointer-events-none z-0 opacity-60"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 229, 255, 0.14), transparent 70%), radial-gradient(circle at 95% 15%, rgba(245, 158, 11, 0.06), transparent 45%)"
          }}
        />
        <div className="relative z-10 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
