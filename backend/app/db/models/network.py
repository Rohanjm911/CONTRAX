from sqlalchemy import Column, String, Integer, Boolean
from app.db.database import Base


class Network(Base):
    __tablename__ = "networks"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    chain_id = Column(Integer, unique=True, nullable=False)
    rpc_url = Column(String(500), nullable=False)
    explorer_api_url = Column(String(500), nullable=True)
    explorer_browser_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
