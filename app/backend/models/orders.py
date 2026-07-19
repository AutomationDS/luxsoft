from core.database import Base
from datetime import datetime
from sqlalchemy import Column, DateTime, Float, Integer, String


class Orders(Base):
    __tablename__ = "orders"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    status = Column(String(50), nullable=True, default='pending', server_default='pending')
    total_amount = Column(Float, nullable=False)
    shipping_address = Column(String, nullable=True)
    payment_status = Column(String(50), nullable=True, default='pending', server_default='pending')
    session_id = Column(String(500), nullable=True)
    tracking_number = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)