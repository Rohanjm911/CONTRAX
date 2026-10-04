import pytest
from app.analyzers.ast.analyzer import ASTAnalyzer


@pytest.mark.asyncio
async def test_ast_analyzer_detects_tx_origin():
    code = """
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;
    contract Auth {
        address owner;
        function update(address a) public {
            require(tx.origin == owner);
            owner = a;
        }
    }
    """
    analyzer = ASTAnalyzer()
    res = await analyzer.analyze("", [{"file_path": "Auth.sol", "content": code}])
    assert res.success is True
    assert len(res.findings) >= 1
    assert any(f.detector == "ast-tx-origin" for f in res.findings)


@pytest.mark.asyncio
async def test_ast_analyzer_detects_unchecked_call():
    code = """
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;
    contract Call {
        function trigger(address target) public {
            target.call{value: 100}("");
        }
    }
    """
    analyzer = ASTAnalyzer()
    res = await analyzer.analyze("", [{"file_path": "Call.sol", "content": code}])
    assert res.success is True
    assert any(f.detector == "ast-unchecked-call" for f in res.findings)
