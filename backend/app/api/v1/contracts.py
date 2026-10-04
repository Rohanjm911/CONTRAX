import os
import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.db.models.contract import Contract
from app.db.models.source_file import SourceFile
from app.db.models.project import Project
from app.db.models.user import User
from app.schemas.contract import ContractResponse
from app.core.authentication import get_current_user
from app.utils.file_security import process_solidity_upload, detect_solidity_pragma
from app.analyzers.ast.parser import SolidityASTParser
from app.blockchain.rpc import fetch_onchain_contract

router = APIRouter(prefix="/contracts", tags=["Contracts"])


@router.post("/upload", response_model=ContractResponse)
async def upload_contract(
    project_id: str = Form(...),
    name: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Uploads single .sol file or .zip archive of a Solidity project.
    Validates content, extracts AST and pragma version, and stores source files.
    """
    p_res = await db.execute(select(Project).where(Project.id == project_id, Project.owner_id == current_user.id))
    project = p_res.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Target project not found.")

    extracted_files = await process_solidity_upload(file)

    primary_name = name
    if not primary_name:
        first_file = os.path.basename(extracted_files[0]["file_path"])
        primary_name = os.path.splitext(first_file)[0]

    pragma_raw, clean_ver = detect_solidity_pragma(extracted_files[0]["content"])

    ast_parser = SolidityASTParser()
    ast_structure = ast_parser.parse_source(extracted_files[0]["file_path"], extracted_files[0]["content"])

    contract = Contract(
        project_id=project_id,
        name=primary_name,
        compiler_version=clean_ver,
        solidity_pragma=pragma_raw,
        is_verified=True,
        ast_tree=ast_structure
    )
    db.add(contract)
    await db.flush()

    for item in extracted_files:
        src = SourceFile(
            contract_id=contract.id,
            file_path=item["file_path"],
            content=item["content"],
            file_size=item["file_size"],
            sha256_hash=item["sha256_hash"]
        )
        db.add(src)

    await db.commit()
    await db.refresh(contract)

    res = await db.execute(select(Contract).where(Contract.id == contract.id).options(selectinload(Contract.source_files)))
    return res.scalars().first()


@router.post("/import-onchain", response_model=ContractResponse)
async def import_onchain_contract(
    project_id: str = Form(...),
    address: str = Form(...),
    network: str = Form("ethereum"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Imports contract via on-chain address & network.
    Retrieves verified source code or bytecode.
    """
    p_res = await db.execute(select(Project).where(Project.id == project_id, Project.owner_id == current_user.id))
    if not p_res.scalars().first():
        raise HTTPException(status_code=404, detail="Target project not found.")

    try:
        onchain_data = await fetch_onchain_contract(address, network)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

    contract = Contract(
        project_id=project_id,
        name=onchain_data["contract_name"],
        address=address,
        network=network,
        compiler_version=onchain_data["compiler_version"],
        is_verified=onchain_data["is_verified"],
        bytecode=onchain_data["bytecode"],
        abi=onchain_data["abi"]
    )
    db.add(contract)
    await db.flush()

    if onchain_data["source_code"]:
        src = SourceFile(
            contract_id=contract.id,
            file_path=f"{onchain_data['contract_name']}.sol",
            content=onchain_data["source_code"],
            file_size=len(onchain_data["source_code"].encode("utf-8")),
            sha256_hash="onchain_verified"
        )
        db.add(src)

    await db.commit()
    await db.refresh(contract)

    res = await db.execute(select(Contract).where(Contract.id == contract.id).options(selectinload(Contract.source_files)))
    return res.scalars().first()


@router.get("/{contract_id}", response_model=ContractResponse)
async def get_contract(
    contract_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Contract).where(Contract.id == contract_id).options(selectinload(Contract.source_files))
    result = await db.execute(stmt)
    contract = result.scalars().first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return contract


@router.get("/{contract_id}/ast")
async def get_contract_ast(
    contract_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns AST breakdown for interactive AST Visualizer."""
    stmt = select(Contract).where(Contract.id == contract_id).options(selectinload(Contract.source_files))
    result = await db.execute(stmt)
    contract = result.scalars().first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    if contract.ast_tree:
        return contract.ast_tree

    if contract.source_files:
        parser = SolidityASTParser()
        ast = parser.parse_source(contract.source_files[0].file_path, contract.source_files[0].content)
        contract.ast_tree = ast
        await db.commit()
        return ast

    return {"contracts": [], "message": "No source available for AST parsing."}
