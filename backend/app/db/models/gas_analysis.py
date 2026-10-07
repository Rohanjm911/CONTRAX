import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base


class GasAnalysis(Base):
    __tablename__ = "gas_analyses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True)
    
    contract_name = Column(String(100), nullable=False)
    function_name = Column(String(100), nullable=False)
    
    reliability = Column(String(20), default="ESTIMATED")
    min_gas = Column(Integer, nullable=True)
    max_gas = Column(Integer, nullable=True)
    avg_gas = Column(Integer, nullable=True)
    
    storage_writes_count = Column(Integer, default=0)
    external_calls_count = Column(Integer, default=0)
    loops_detected = Column(Integer, default=0)
    details = Column(JSON, default=dict)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    scan = relationship("Scan", back_populates="gas_analyses")
