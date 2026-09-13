import boto3
from aws.config import config

class S3Client:
    def __init__(self):
        self.client = boto3.client("s3", region_name = config.AWS_REGION)
        self.bucket_name = config.BUCKET_NAME
        