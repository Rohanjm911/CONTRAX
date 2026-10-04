import os
import zipfile
import re
import hashlib
from typing import List, Tuple, Dict
from fastapi import UploadFile, HTTPException, status
from app.config.settings import settings
from app.config.logging import logger

SOL_EXTENSIONS = {".sol"}
ZIP_EXTENSIONS = {".zip"}


class FileSecurityError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


def sanitize_filename(filename: str) -> str:
    """Removes path traversals, special shell characters and normalizes filename."""
    base = os.path.basename(filename)
    cleaned = re.sub(r"[^\w\.\-\_]", "_", base)
    return cleaned


def calculate_sha256(content: str) -> str:
    """Computes SHA256 hex digest for text content."""
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def detect_solidity_pragma(content: str) -> Tuple[str, str]:
    """
    Scans source code for pragma solidity ^0.8.20 / >=0.8.0.
    Returns (pragma_string, clean_version)
    """
    pattern = r"pragma\s+solidity\s+([^;]+);"
    match = re.search(pattern, content)
    if match:
        pragma_str = match.group(1).strip()
        ver_match = re.search(r"(\d+\.\d+\.\d+)", pragma_str)
        clean_ver = ver_match.group(1) if ver_match else "0.8.20"
        return pragma_str, clean_ver
    return "unknown", "0.8.20"


async def process_solidity_upload(file: UploadFile) -> List[Dict[str, str]]:
    """
    Safely validates, parses, and unpacks single .sol or .zip files.
    Enforces strict ZIP bomb defenses and path traversal guards.
    """
    filename = sanitize_filename(file.filename or "unknown.sol")
    _, ext = os.path.splitext(filename.lower())
    
    body = await file.read()
    if len(body) > settings.MAX_UPLOAD_SIZE:
        raise FileSecurityError(f"Uploaded file exceeds maximum allowed limit ({settings.MAX_UPLOAD_SIZE} bytes)")
    
    extracted_files: List[Dict[str, str]] = []

    if ext in SOL_EXTENSIONS:
        try:
            content = body.decode("utf-8", errors="replace")
        except Exception:
            raise FileSecurityError("Unable to decode Solidity file as UTF-8.")
        
        extracted_files.append({
            "file_path": filename,
            "content": content,
            "file_size": len(body),
            "sha256_hash": calculate_sha256(content)
        })

    elif ext in ZIP_EXTENSIONS:
        import io
        try:
            with zipfile.ZipFile(io.BytesIO(body), "r") as z:
                total_uncompressed = 0
                file_count = 0
                
                for info in z.infolist():
                    file_count += 1
                    if file_count > settings.MAX_ZIP_FILE_COUNT:
                        raise FileSecurityError("Zip file contains too many files (ZIP bomb protection).")

                    target_path = info.filename
                    if target_path.startswith("/") or ".." in target_path or "\\" in target_path:
                        logger.warning(f"Blocked path traversal attempt in zip: {target_path}")
                        continue
                    
                    total_uncompressed += info.file_size
                    if total_uncompressed > settings.MAX_ZIP_EXTRACTED_SIZE:
                        raise FileSecurityError("Zip extracted size exceeds quota (decompression bomb protection).")

                    if info.is_dir():
                        continue

                    if target_path.lower().endswith(".sol"):
                        with z.open(info) as f:
                            file_bytes = f.read()
                            content = file_bytes.decode("utf-8", errors="replace")
                            extracted_files.append({
                                "file_path": target_path,
                                "content": content,
                                "file_size": len(file_bytes),
                                "sha256_hash": calculate_sha256(content)
                            })
        except zipfile.BadZipFile:
            raise FileSecurityError("Invalid or corrupted ZIP archive.")
    else:
        raise FileSecurityError("Invalid file extension. Please upload a .sol file or a .zip Solidity project.")

    if not extracted_files:
        raise FileSecurityError("No valid Solidity (.sol) files found in uploaded payload.")

    return extracted_files
