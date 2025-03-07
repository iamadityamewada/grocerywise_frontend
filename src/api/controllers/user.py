from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.config.db import get_db
from src.api.services.user import UserServices
from src.dtos.UserDTO import CreateUserDTO, UserDTO
from typing import List

user_router = APIRouter()
user_services = UserServices()

# Create a new user
@user_router.post("/create-user")
def register_user(user_data: CreateUserDTO, db: Session = Depends(get_db)):
    return user_services.create_user(user_data,db)

# # Get user by ID
# @router.get("/users/{user_id}", response_model=UserDTO)
# def get_user(user_id: int, db: Session = Depends(get_db)):
#     try:
#         user = get_user_by_id(db, user_id)
#         return {"status": "success", "data": user, "message": "User retrieved successfully"}
#     except HTTPException as e:
#         raise e
#     except Exception as e:
#         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# # Delete user by ID
# @router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
# def remove_user(user_id: int, db: Session = Depends(get_db)):
#     try:
#         delete_user(db, user_id)
#         return {"status": "success", "message": "User deleted successfully"}
#     except HTTPException as e:
#         raise e
#     except Exception as e:
#         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
