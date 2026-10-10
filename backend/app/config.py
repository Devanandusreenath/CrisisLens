from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    serpapi_api_key: str = ""
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.1-flash-lite"
    frontend_origin: str = "http://localhost:8080"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
