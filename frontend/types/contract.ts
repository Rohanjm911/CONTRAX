export interface Finding {
  id: string;
  scan_id: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  category: string;
  detector: string;
  description: string;
  impact: string;
  contract_name?: string;
  function_name?: string;
  source_file: string;
  line_number?: number;
  source_range?: Record<string, any>;
  code_snippet?: string;
  detection_tool: string;
  remediation: string;
  references: string[];
  is_reviewed: "UNREVIEWED" | "CONFIRMED" | "FALSE_POSITIVE";
  created_at: string;
}

export interface SourceFile {
  id: string;
  file_path: string;
  content: string;
  file_size: number;
  sha256_hash: string;
  created_at: string;
}

export interface Contract {
  id: string;
  project_id: string;
  name: string;
  compiler_version?: string;
  solidity_pragma?: string;
  address?: string;
  network?: string;
  is_verified: boolean;
  optimization_used?: boolean;
  abi?: any;
  created_at: string;
  source_files?: SourceFile[];
}

export interface ScanStatus {
  id: string;
  contract_id: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  current_stage: string;
  progress_percentage: number;
  stage_breakdown: Record<string, string>;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  informational_count: number;
  elapsed_time: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface GasAnalysisItem {
  id: string;
  scan_id: string;
  contract_name: string;
  function_name: string;
  reliability: "ESTIMATED" | "SIMULATED" | "OBSERVED" | "UNAVAILABLE";
  min_gas?: number;
  max_gas?: number;
  avg_gas?: number;
  storage_writes_count: number;
  external_calls_count: number;
  loops_detected: number;
  details: Record<string, any>;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  contract_count?: number;
}
