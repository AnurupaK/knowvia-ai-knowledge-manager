import os

# Dummy environment variables for CI tests.
# These are NOT real AWS credentials.
os.environ["AWS_REGION"] = "test-region"
os.environ["S3_BUCKET_NAME"] = "test-bucket"

os.environ[
    "KNOWLEDGE_CURRENT_VERSION_PATH"
] = "test/knowledge_base/current_version/"

os.environ[
    "FAQ_CURRENT_VERSION_PATH"
] = "test/faq/current_version/"

os.environ[
    "BACKUP_PATH"
] = "test/knowledge_base/backup/"

os.environ[
    "METADATA_PATH"
] = "test/knowledge_base/metadata/"

os.environ[
    "VECTOR_STORE"
] = "test/vector_store/"

os.environ[
    "FLASK_SECRET_KEY"
] = "test-secret-key"


import pytest

from backend.app import app


@pytest.fixture
def client():

    app.config["TESTING"] = True

    with app.test_client() as client:
        yield client