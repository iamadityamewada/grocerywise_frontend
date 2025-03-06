from fastapi import FastAPI
from src.router import router



app = FastAPI(
    title="Grocery Management Api",
    description= "api using fastapi and sqlite",
    version="1.0.0",
    docs_url="/management/docs",
)


@app.get('/')
def read_root():
    return {"Project is Live"}


app.include_router(router)