from sqlalchemy.orm import Session
from src.models.user import User
from src.dtos.UserDTO import CreateUserDTO
from fastapi import HTTPException, status
from passlib.context import CryptContext
from sqlalchemy.exc import SQLAlchemyError

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hash the password
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Create a new user

class UserServices:
        def create_user(self,  user_data: CreateUserDTO, db: Session,):
            # try:
                user = db.query(User).filter(User.email == user_data.email).first()
                if user:
                     return {"id": user.id, "name": user.name, "email": user.email, "message": "User Already Exist"}

            # except Exception as e:
                #  return e    
            #     hashed_password = hash_password(user_data.password)
            #     new_user = User(
            #         name=user_data.name,
            #         email=user_data.email,
            #         hashed_password=hashed_password
            #     )
            #     db.add(new_user)
            #     db.commit()
            #     db.refresh(new_user)
            #     return new_user
            # except SQLAlchemyError as e:
            #     db.rollback()
            #     raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error creating user")
            
                # try:
                #     new_user = user_services.create_user(db, user_data)
                #     if new_user:
                #        return {"status": "success", "data": new_user, "message": "User created successfully"}
                #     else:
                #           {"status": "success", "data": new_user, "message": "User Already Exist"}
                # except HTTPException as e:
                #     raise e
                # except Exception as e:
                #     raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

        # # Get user by ID
        # def get_user_by_id(db: Session, user_id: int):
        #     try:
        #         user = db.query(User).filter(User.id == user_id).first()
        #         if not user:
        #             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        #         return user
        #     except SQLAlchemyError as e:
        #         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error retrieving user")

        # # Get user by email
        # def get_user_by_email(db: Session, email: str):
        #     try:
        #         user = db.query(User).filter(User.email == email).first()
        #         if not user:
        #             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        #         return user
        #     except SQLAlchemyError as e:
        #         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error retrieving user")

        # # Delete user by ID
        # def delete_user(db: Session, user_id: int):
        #     try:
        #         user = get_user_by_id(db, user_id)
        #         if not user:
        #             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        #         db.delete(user)
        #         db.commit()
        #         return user
        #     except SQLAlchemyError as e:
        #         db.rollback()
                # raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error deleting user")
