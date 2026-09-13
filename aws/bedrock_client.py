import boto3

from aws.config import config


class BedrockClient:

    def __init__(self):

        self.client = boto3.client("bedrock-runtime", region_name = config.AWS_REGION)
        
if __name__ == "__main__":

    bedrock = BedrockClient()

    print("Bedrock client created successfully")