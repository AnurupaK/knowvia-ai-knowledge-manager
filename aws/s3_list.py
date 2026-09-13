from botocore.exceptions import ClientError
from aws.s3_client import S3Client


class S3List:

    def __init__(self):

        self.s3 = S3Client()


    def list_json_files(self,inside_folder: str):

        try:

            response = self.s3.client.list_objects_v2(
                Bucket=self.s3.bucket_name,
                Prefix=inside_folder
            )

            json_files = []
            
           

            for dict_obj in response.get("Contents", []):

                key = dict_obj["Key"]

                if key.endswith("/"):
                    continue

                if not key.endswith(".json"):
                    continue

                json_files.append(key.replace(inside_folder,""))
                

            return json_files

        except ClientError as e:

            raise Exception(
                f"Failed to list json files: {str(e)}"
            )


if __name__ == "__main__":

    s3_list = S3List()

    files = s3_list.list_json_files(inside_folder="knowledge_base/current_version/")

    print(files)