import logging
import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)

# Load .env before creating the Settings object
env_path = Path(__file__).parent.parent.parent / ".env"

if env_path.exists():
    load_dotenv(env_path, override=True)


class Settings(BaseSettings):
    # Application
    app_name: str = "FastAPI Modular Template"
    debug: bool = False
    version: str = "1.0.0"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # AWS Lambda Configuration
    is_lambda: bool = False
    lambda_function_name: str = "fastapi-backend"
    aws_region: str = "us-east-1"

    @property
    def backend_url(self) -> str:
        """Generate backend URL from host and port."""
        if self.is_lambda:
            return os.environ.get(
                "PYTHON_BACKEND_URL",
                f"https://{self.lambda_function_name}.execute-api.{self.aws_region}.amazonaws.com",
            )
        else:
            display_host = "127.0.0.1" if self.host == "0.0.0.0" else self.host
            return os.environ.get(
                "PYTHON_BACKEND_URL",
                f"http://{display_host}:{self.port}",
            )

    class Config:
        case_sensitive = False
        extra = "ignore"

    def __getattr__(self, name: str) -> Any:
        """
        Dynamically read attributes from environment variables.
        Example:
            settings.database_url -> DATABASE_URL
            settings.stripe_secret_key -> STRIPE_SECRET_KEY
        """
        env_var_name = name.upper()

        if env_var_name in os.environ:
            value = os.environ[env_var_name]
            self.__dict__[name] = value
            logger.debug(
                f"Read dynamic attribute {name} from environment variable {env_var_name}"
            )
            return value

        raise AttributeError(
            f"'{self.__class__.__name__}' object has no attribute '{name}'"
        )


# Global settings instance
settings = Settings()
