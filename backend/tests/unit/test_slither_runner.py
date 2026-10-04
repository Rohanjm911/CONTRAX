import pytest
from app.analyzers.slither.runner import SlitherAnalyzer


@pytest.mark.asyncio
async def test_slither_reentrancy_detection():
    vulnerable_code = """
    contract Vault {
        mapping(address => uint256) balances;
        function withdraw() public {
            uint b = balances[msg.sender];
            (bool s, ) = msg.sender.call{value: b}("");
            balances[msg.sender] = 0;
        }
    }
    """
    analyzer = SlitherAnalyzer()
    res = await analyzer.analyze("", [{"file_path": "Vault.sol", "content": vulnerable_code}])
    assert res.success is True
    reentrancy_findings = [f for f in res.findings if "reentrancy" in f.category.lower()]
    assert len(reentrancy_findings) > 0
    assert reentrancy_findings[0].severity == "CRITICAL"
