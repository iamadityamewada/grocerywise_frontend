from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Explicitly load environment variables from the .env file
load_dotenv()

class Settings(BaseSettings):
    ENV: str = "development"
    # Using SQLite, you only need the path to the .db file
    SQLITE_DB_PATH: str = "sqlite:///./grocery.db"

    class Config:
        env_file = ".env"


# Now you can use settings like this:
settings = Settings()

# Example usage
print(settings.SQLITE_DB_PATH)
