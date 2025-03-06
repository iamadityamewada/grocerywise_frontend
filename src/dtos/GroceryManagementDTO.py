from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

# DTO for creating a new grocery item
class CreateGroceryDTO(BaseModel):
    name: str
    quantity: int
    price: float
    category: str

    model_config = ConfigDict(from_attributes=True)  # Allows working with ORM models


# DTO for representing grocery data, including `id` and `created_at`
class GroceryDTO(BaseModel):
    id: int
    name: str
    quantity: int
    price: float
    category: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# DTO for updating an existing grocery item (optional fields)
class UpdateGroceryDTO(BaseModel):
    name: Optional[str] = None
    quantity: Optional[int] = None
    price: Optional[float] = None
    category: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
