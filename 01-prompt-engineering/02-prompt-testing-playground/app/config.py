from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    demo_mode: bool = True
    openai_api_key: str = ""
    openai_model: str = "gpt-5.6-luna"
    database_url: str = "sqlite:///./prompt_playground.db"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
