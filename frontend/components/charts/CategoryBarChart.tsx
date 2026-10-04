import React from "react";
import { Finding } from "@/types/contract";

interface CategoryBarChartProps {
  findings: Finding[];
}

export const CategoryBarChart: React.FC<CategoryBarChartProps> = ({ findings }) => {
  const categoriesMap: Record<string, { count: number; maxSeverity: string }> = {};

  findings.forEach((f) => {
    const cat = f.category || "General Logic";
    if (!categoriesMap[cat]) {
      categoriesMap[cat] = { count: 0, maxSeverity: f.severity };
    }
    categoriesMap[cat].count += 1;
    if (f.severity === "CRITICAL") categoriesMap[cat].maxSeverity = "CRITICAL";
    else if (f.severity === "HIGH" && categoriesMap[cat].maxSeverity !== "CRITICAL") {
      categoriesMap[cat].maxSeverity = "HIGH";
    }
  });

  const categories = Object.keys(categoriesMap).map((cat) => ({
    name: cat,
    count: categoriesMap[cat].count,
    maxSeverity: categoriesMap[cat].maxSeverity,
  }));

  const displayCategories =
    categories.length > 0
      ? categories
      : [
          { name: "Reentrancy", count: 0, maxSeverity: "CRITICAL" },
          { name: "Access Control", count: 0, maxSeverity: "HIGH" },
          { name: "External Calls", count: 0, maxSeverity: "MEDIUM" },
          { name: "Randomness & Time", count: 0, maxSeverity: "LOW" },
          { name: "Gas Inefficiency", count: 0, maxSeverity: "INFORMATIONAL" },
        ];

  const maxCount = Math.max(...displayCategories.map((c) => c.count), 1);

  const getSeverityConfig = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return { color: "#EF4444", short: "CRIT" };
      case "HIGH":
        return { color: "#F97316", short: "HIGH" };
      case "MEDIUM":
        return { color: "#F59E0B", short: "MED" };
      case "LOW":
        return { color: "#00E5FF", short: "LOW" };
      default:
        return { color: "#38BDF8", short: "INFO" };
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-4 border-b border-[#1F2B3E]">
        <div>
          <div className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider">
            SWC TAXONOMY
          </div>
          <h3 className="text-xs font-semibold text-[#F3F6FA] uppercase tracking-wider">
            Vulnerability by Category
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#94A3B8] px-2 py-0.5 bg-[#0B0F17] rounded-md border border-[#1F2B3E]">
          {displayCategories.length} Categories
        </span>
      </div>

      <div className="py-2.5 space-y-2 flex-1 flex flex-col justify-center">
        {displayCategories.map((cat) => {
          const percentage = (cat.count / maxCount) * 100;
          const { color, short } = getSeverityConfig(cat.maxSeverity);

          return (
            <div
              key={cat.name}
              className="px-2.5 py-1.5 rounded-xl hover:bg-[#17202E]/50 transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 min-w-0 pr-2">
                  <span
                    className="w-2 h-2 rounded-[2px] flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[#94A3B8] text-xs font-medium font-sans truncate">
                    {cat.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2 font-mono text-xs flex-shrink-0">
                  <span className="text-[10px] text-[#64748B] font-mono uppercase">
                    {short}
                  </span>
                  <span
                    className={`font-semibold ${
                      cat.count > 0 ? "text-[#F3F6FA]" : "text-[#64748B]"
                    }`}
                  >
                    {cat.count}
                  </span>
                </div>
              </div>

              <div className="w-full h-1.5 bg-[#0B0F17] rounded-full overflow-hidden border border-[#1F2B3E]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${cat.count > 0 ? Math.max(percentage, 6) : 0}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
