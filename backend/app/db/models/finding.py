import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base


class Finding(Base):
    __tablename__ = "findings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String(255), nullable=False, index=True)
    severity = Column(String(20), nullable=False, index=True)
    confidence = Column(String(20), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    detector = Column(String(100), nullable=False)
    
    description = Column(Text, nullable=False)
    impact = Column(Text, nullable=False)
    contract_name = Column(String(100), nullable=True)
    function_name = Column(String(100), nullable=True)
    source_file = Column(String(500), nullable=False)
    line_number = Column(Integer, nullable=True)
    source_range = Column(JSON, nullable=True)
    code_snippet = Column(Text, nullable=True)
    detection_tool = Column(String(50), nullable=False)
    
    remediation = Column(Text, nullable=False)
    references = Column(JSON, default=list)
    
    is_reviewed = Column(String(20), default="UNREVIEWED")

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    scan = relationship("Scan", back_populates="findings")
