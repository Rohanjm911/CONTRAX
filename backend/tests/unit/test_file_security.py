import pytest
from app.utils.file_security import sanitize_filename, calculate_sha256, detect_solidity_pragma


def test_sanitize_filename_prevents_traversal():
    dangerous = "../../etc/passwd.sol"
    clean = sanitize_filename(dangerous)
    assert ".." not in clean
    assert clean == "passwd.sol"


def test_calculate_sha256():
    sample = "contract Test {}"
    digest = calculate_sha256(sample)
    assert len(digest) == 64
    assert digest == calculate_sha256(sample)


def test_detect_solidity_pragma():
    code = "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\ncontract Vault {}"
    pragma_raw, clean_ver = detect_solidity_pragma(code)
    assert "^0.8.20" in pragma_raw
    assert clean_ver == "0.8.20"
