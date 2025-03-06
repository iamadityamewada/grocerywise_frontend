from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

# Base model class
Base = declarative_base()

class Grocery(Base):
    __tablename__ = 'groceries'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utc)

    def __repr__(self):
        return f"<Grocery(name={self.name}, quantity={self.quantity}, category={self.category})>"
