import os
from pathlib import Path
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"
load_dotenv(ENV_PATH, override=True)


class Config:

    def __init__(self):

        self.AWS_REGION = self._get_env("AWS_REGION")

        self.BUCKET_NAME = self._get_env("S3_BUCKET_NAME")

        self.KNOWLEDGE_CURRENT_VERSION_FOLDER = self._get_env(
            "KNOWLEDGE_CURRENT_VERSION_PATH"
        )

        self.FAQ_CURRENT_VERSION_FOLDER = self._get_env(
            "FAQ_CURRENT_VERSION_PATH"
        )

        self.BACKUP_FOLDER = self._get_env("BACKUP_PATH")

        self.METADATA_FOLDER = self._get_env("METADATA_PATH")

        self.VECTOR_STORE_FOLDER = self._get_env("VECTOR_STORE")


    @staticmethod
    def _get_env(key):

        value = os.getenv(key)

        if not value:

            raise ValueError(
                f"Missing environment variable: {key}"
            )

        return value


config = Config()


if __name__ == "__main__":

    print(config.AWS_REGION)
    print(config.BUCKET_NAME)

    print(
        config.KNOWLEDGE_CURRENT_VERSION_FOLDER
    )

    print(
        config.FAQ_CURRENT_VERSION_FOLDER
    )

    print(config.METADATA_FOLDER)
    print(config.BACKUP_FOLDER)