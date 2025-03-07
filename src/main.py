from fastapi import FastAPI
from src.router import router  # Assuming you have defined routes in src.router
from src.models.GroceryManagement import Base
from src.models.user import Base
from src.config.db import engine

# Create database tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Grocery Management API",
    description="API using FastAPI and SQLite",
    version="1.0.0",
    docs_url="/grocery-services/docs",
)


# Include the API router
app.include_router(router)

@app.get('/')
async def read_root():
    return {"message": "Project is Live GMS"}


 