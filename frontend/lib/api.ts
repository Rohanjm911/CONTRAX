const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

// In-memory cache for static contract artifacts (AST, Gas profiling)
const astCache = new Map<string, any>();
const gasCache = new Map<string, any>();

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 12000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function fetchProjects() {
  const res = await fetchWithTimeout(`${API_BASE}/projects`);
  if (!res.ok) throw new Error("Failed to load projects");
  return res.json();
}

export async function createProject(name: string, description?: string) {
  const res = await fetchWithTimeout(`${API_BASE}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description })
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

export async function uploadContract(projectId: string, file: File) {
  const formData = new FormData();
  formData.append("project_id", projectId);
  formData.append("file", file);

  const res = await fetchWithTimeout(`${API_BASE}/contracts/upload`, {
    method: "POST",
    body: formData
  }, 30000);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function importOnchainContract(projectId: string, address: string, network: string) {
  const formData = new FormData();
  formData.append("project_id", projectId);
  formData.append("address", address);
  formData.append("network", network);

  const res = await fetchWithTimeout(`${API_BASE}/contracts/import-onchain`, {
    method: "POST",
    body: formData
  }, 30000);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Import failed" }));
    throw new Error(err.detail || "Import failed");
  }
  return res.json();
}

export async function startScan(contractId: string) {
  // Clear any existing cache for this contract
  astCache.delete(contractId);
  const res = await fetchWithTimeout(`${API_BASE}/scans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contract_id: contractId, scan_type: "SOURCE_CODE" })
  });
  if (!res.ok) throw new Error("Failed to dispatch scan");
  return res.json();
}

export async function fetchScans() {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/scans`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchAllFindings(scanId?: string, severity?: string) {
  try {
    const params = new URLSearchParams();
    if (scanId) params.append("scan_id", scanId);
    if (severity && severity !== "ALL") params.append("severity", severity);
    const query = params.toString() ? `?${params.toString()}` : "";
    
    const res = await fetchWithTimeout(`${API_BASE}/findings${query}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getScanStatus(scanId: string) {
  const res = await fetchWithTimeout(`${API_BASE}/scans/${scanId}/status`);
  if (!res.ok) throw new Error("Failed to get scan status");
  return res.json();
}

export async function getScanFindings(scanId: string) {
  const res = await fetchWithTimeout(`${API_BASE}/scans/${scanId}/findings`);
  if (!res.ok) throw new Error("Failed to get findings");
  return res.json();
}

export async function getGasAnalysis(scanId: string) {
  if (gasCache.has(scanId)) {
    return gasCache.get(scanId);
  }
  const res = await fetchWithTimeout(`${API_BASE}/gas/scan/${scanId}`);
  if (!res.ok) throw new Error("Failed to get gas analysis");
  const data = await res.json();
  gasCache.set(scanId, data);
  return data;
}

export async function getContractAST(contractId: string) {
  if (astCache.has(contractId)) {
    return astCache.get(contractId);
  }
  const res = await fetchWithTimeout(`${API_BASE}/contracts/${contractId}/ast`);
  if (!res.ok) throw new Error("Failed to get contract AST");
  const data = await res.json();
  astCache.set(contractId, data);
  return data;
}

export async function getContractDetails(contractId: string) {
  const res = await fetchWithTimeout(`${API_BASE}/contracts/${contractId}`);
  if (!res.ok) throw new Error("Failed to get contract details");
  return res.json();
}
