import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    compiler_version = Column(String(50), nullable=True)
    solidity_pragma = Column(String(50), nullable=True)
    
    address = Column(String(42), nullable=True, index=True)
    network = Column(String(50), nullable=True)
    is_verified = Column(Boolean, default=False)
    optimization_used = Column(Boolean, nullable=True)
    runs = Column(String(20), nullable=True)
    evm_version = Column(String(50), nullable=True)
    
    abi = Column(JSON, nullable=True)
    bytecode = Column(Text, nullable=True)
    contract_metadata = Column(JSON, nullable=True)
    ast_tree = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    project = relationship("Project", back_populates="contracts")
    source_files = relationship("SourceFile", back_populates="contract", cascade="all, delete-orphan")
    scans = relationship("Scan", back_populates="contract", cascade="all, delete-orphan")
