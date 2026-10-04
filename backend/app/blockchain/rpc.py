import re
import httpx
from typing import Dict, Any
from app.config.settings import settings
from app.config.logging import logger

NETWORKS_CONFIG = {
    "ethereum": {
        "name": "Ethereum Mainnet",
        "rpc": settings.RPC_ETHEREUM,
        "explorer_api": "https://api.etherscan.io/api",
        "api_key": settings.ETHERSCAN_API_KEY
    },
    "sepolia": {
        "name": "Sepolia Testnet",
        "rpc": settings.RPC_SEPOLIA,
        "explorer_api": "https://api-sepolia.etherscan.io/api",
        "api_key": settings.ETHERSCAN_API_KEY
    },
    "polygon": {
        "name": "Polygon PoS",
        "rpc": settings.RPC_POLYGON,
        "explorer_api": "https://api.polygonscan.com/api",
        "api_key": settings.POLYGONSCAN_API_KEY
    },
    "arbitrum": {
        "name": "Arbitrum One",
        "rpc": settings.RPC_ARBITRUM,
        "explorer_api": "https://api.arbiscan.io/api",
        "api_key": settings.ARBISCAN_API_KEY
    },
    "optimism": {
        "name": "Optimism Mainnet",
        "rpc": settings.RPC_OPTIMISM,
        "explorer_api": "https://api-optimistic.etherscan.io/api",
        "api_key": settings.OPTIMISMSCAN_API_KEY
    },
    "base": {
        "name": "Base Mainnet",
        "rpc": settings.RPC_BASE,
        "explorer_api": "https://api.basescan.org/api",
        "api_key": settings.BASESCAN_API_KEY
    }
}


def is_valid_evm_address(address: str) -> bool:
    """Validates 0x-prefixed 40-hex-character address format."""
    return bool(re.match(r"^0x[a-fA-F0-9]{40}$", address))


async def fetch_onchain_contract(address: str, network: str) -> Dict[str, Any]:
    """
    Connects to network RPC / Explorer API:
    - Retrieves verified source code if available
    - Retrieves bytecode if verified source is missing
    - Transparently tags source verification status
    """
    if not is_valid_evm_address(address):
        raise ValueError("Invalid Ethereum address format.")

    net_info = NETWORKS_CONFIG.get(network.lower())
    if not net_info:
        raise ValueError(f"Unsupported network: {network}. Supported: {list(NETWORKS_CONFIG.keys())}")

    result = {
        "address": address,
        "network": network,
        "is_verified": False,
        "contract_name": "Contract_" + address[-6:],
        "compiler_version": None,
        "source_code": None,
        "bytecode": None,
        "abi": None,
        "disclaimer": "Analysis is limited to available contract bytecode and metadata if source is unverified."
    }

    api_url = net_info.get("explorer_api")
    api_key = net_info.get("api_key")
    if api_url:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                params = {
                    "module": "contract",
                    "action": "getsourcecode",
                    "address": address
                }
                if api_key:
                    params["apikey"] = api_key
                resp = await client.get(api_url, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get("status") == "1" and data.get("result"):
                        c_data = data["result"][0]
                        source = c_data.get("SourceCode", "")
                        if source and source != "":
                            result["is_verified"] = True
                            result["contract_name"] = c_data.get("ContractName") or result["contract_name"]
                            result["compiler_version"] = c_data.get("CompilerVersion")
                            result["source_code"] = source
                            result["abi"] = c_data.get("ABI")
                            result["disclaimer"] = "Verified source code successfully retrieved."
        except Exception as e:
            logger.warning(f"Explorer API retrieval exception: {e}")

    if not result["is_verified"]:
        rpc_url = net_info.get("rpc")
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                payload = {
                    "jsonrpc": "2.0",
                    "method": "eth_getCode",
                    "params": [address, "latest"],
                    "id": 1
                }
                rpc_resp = await client.post(rpc_url, json=payload)
                if rpc_resp.status_code == 200:
                    rpc_json = rpc_resp.json()
                    bytecode = rpc_json.get("result")
                    if bytecode and bytecode != "0x":
                        result["bytecode"] = bytecode
        except Exception as e:
            logger.warning(f"RPC eth_getCode exception: {e}")

    return result
