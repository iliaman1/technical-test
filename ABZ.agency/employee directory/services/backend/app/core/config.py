from pathlib import Path
from pydantic_settings import BaseSettings


ROOT_DIR = Path(__file__).resolve().parents[4]


class Settings(BaseSettings):
    DB_HOST: str
    DB_PORT: int
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str

    class Config:
        env_file = ROOT_DIR / ".env"

    @property
    def database_url(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.POSTGRES_DB}"


settings = Settings()  # type: ignore
