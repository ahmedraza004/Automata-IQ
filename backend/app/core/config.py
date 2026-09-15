import os
from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    APP_NAME: str = "AutomataIQ"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    # Security
    SECRET_KEY: str = "automata_super_secret_jwt_key_2026_change_in_production_!@#$"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str = "sqlite:///./automata.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # AI Model Providers
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    DEFAULT_AI_PROVIDER: str = "gemini"
    DEFAULT_AI_MODEL: str = "gemini-2.5-flash"

    # Confidence Scoring Thresholds
    CONFIDENCE_AUTO_EXECUTE_THRESHOLD: float = 95.0
    CONFIDENCE_MANAGER_REVIEW_THRESHOLD: float = 80.0

    # Integration settings
    ODOO_URL: str = "http://localhost:8069"
    ODOO_DB: str = "odoo"
    ODOO_USERNAME: str = "admin"
    ODOO_PASSWORD: str = "admin"

    SLACK_WEBHOOK_URL: str = ""
    SLACK_CHANNEL: str = "#operations-alerts"

    JIRA_URL: str = "https://your-domain.atlassian.net"
    JIRA_EMAIL: str = "ops@company.com"
    JIRA_API_TOKEN: str = "mock_token"
    JIRA_PROJECT_KEY: str = "OPS"

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "alerts@automatai.com"
    SMTP_PASSWORD: str = "mock_pass"
    EMAILS_FROM_EMAIL: str = "alerts@automatai.com"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow",
    )


settings = Settings()
