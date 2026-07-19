from core.database import Base
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String


class Products(Base):
    __tablename__ = "products"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    name = Column(String(200), nullable=False)
    slug = Column(String(200), nullable=False)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    category_id = Column(Integer, nullable=False)
    image_url = Column(String(500), nullable=True)
    images = Column(String, nullable=True)
    brand = Column(String(100), nullable=True)
    rating = Column(Float, nullable=True, default=0, server_default='0')
    review_count = Column(Integer, nullable=True, default=0, server_default='0')
    stock = Column(Integer, nullable=True, default=100, server_default='100')
    is_featured = Column(Boolean, nullable=True, default=False, server_default='false')
    is_trending = Column(Boolean, nullable=True, default=False, server_default='false')
    colors = Column(String(500), nullable=True)
    sizes = Column(String(500), nullable=True)
    tags = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)