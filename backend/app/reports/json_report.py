import json
from typing import Dict, Any, List
from datetime import datetime, timezone


def generate_json_audit_report(
    contract_info: Dict[str, Any],
    findings: List[Dict[str, Any]],
    gas_analysis: List[Dict[str, Any]],
    pipeline_stages: Dict[str, str],
    elapsed_time: float
) -> Dict[str, Any]:
    """
    Generates a structured, auditor-compliant JSON security report.
    """
    counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "INFORMATIONAL": 0}
    for f in findings:
        sev = f.get("severity", "INFORMATIONAL")
        if sev in counts:
            counts[sev] += 1

    report = {
        "report_metadata": {
            "platform": "CONTRAX",
            "tagline": "See the flaw before they do.",
            "version": "1.0.0",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "elapsed_time_seconds": elapsed_time
        },
        "target_contract": {
            "name": contract_info.get("name"),
            "network": contract_info.get("network", "Local / Source Upload"),
            "address": contract_info.get("address"),
            "compiler_version": contract_info.get("compiler_version"),
            "is_verified": contract_info.get("is_verified", False)
        },
        "security_overview": {
            "total_findings": len(findings),
            "severity_breakdown": counts,
            "pipeline_stages": pipeline_stages
        },
        "findings": findings,
        "gas_efficiency_analysis": gas_analysis,
        "disclaimer": (
            "AUTOMATED SECURITY AUDIT NOTICE: This report was generated using CONTRAX automated static "
            "and symbolic analysis tools (Solidity AST parser, Slither, Mythril, and Gas profiler). "
            "Automated tools may miss domain-specific business logic errors and produce false positives. "
            "This report DOES NOT replace a thorough manual smart contract security review by expert auditors."
        )
    }

    return report
