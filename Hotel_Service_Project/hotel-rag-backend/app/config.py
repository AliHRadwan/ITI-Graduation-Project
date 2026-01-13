"""Configuration settings loaded from environment variables."""

from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Google Gemini Configuration (for embeddings)
    google_api_key: str
    embedding_model: str = "gemini-embedding-001"
    embedding_dim: int = 3072
    
    # Groq Configuration (for LLM)
    groq_api_key: str
    llm_model: str = "llama-3.1-8b-instant"  # Fast and reliable model (can be overridden in .env)

    # Database Configuration
    database_url: str

    # Knowledge Base Configuration
    hotel_knowledge_dir: str = "./hotel_knowledge"
    default_audience: str = "guest"

    class Config:
        """Pydantic config."""

        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

    @property
    def knowledge_dir_path(self) -> Path:
        """Return the knowledge directory as a Path object."""
        return Path(self.hotel_knowledge_dir).resolve()


# Global settings instance
settings = Settings()

