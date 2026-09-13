from botocore.exceptions import ClientError
from aws.s3_client import S3Client
import json


class S3Get:
    def __init__(self):
        self.s3 = S3Client()
        
    def get_json(self, inside_folder:str, file_name:str,):
        json_file = inside_folder + file_name + ".json"
        
        try:
            response = self.s3.client.get_object(
                Bucket = self.s3.bucket_name,
                Key = json_file
            )
            
            content  = response["Body"].read().decode("utf-8")
            
            return json.loads(content)
                    
            
        except ClientError as e:
            error_code = e.response["Error"]["Code"]
            
            if error_code == "NoSuchKey":
                raise Exception(f"File not found in S3: {json_file.replace(inside_folder,"")}")
            
            elif error_code == "AccessDenied":
                raise Exception(f"S3 access denied")
            
            else:
                raise Exception(f"S3 error: {str(e)}")      
          
          
if __name__ == "__main__":
    s3_get = S3Get()
    file_name = "ryukyuAI_001"
    inside_folder = "knowledge_base/current_version/"
    s3_get.get_json(inside_folder,file_name)