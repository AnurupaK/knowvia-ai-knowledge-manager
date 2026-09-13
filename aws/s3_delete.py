from botocore.exceptions import ClientError

from aws.s3_client import S3Client


class S3Delete:

    def __init__(self):

        self.s3 = S3Client()

    def delete_file(
        self,
        inside_folder: str,
        file_name: str
    ):

        json_file = (
            inside_folder
            + file_name
            + ".json"
        )

        try:

            self.s3.client.delete_object(
                Bucket=self.s3.bucket_name,
                Key=json_file
            )

            return {
                "message": "Delete successful",
                "file": json_file
            }

        except ClientError as e:

            raise Exception(
                f"S3 delete error: {str(e)}"
            )


if __name__ == "__main__":

    s3_delete = S3Delete()

    result = s3_delete.delete_file(
        inside_folder="knowledge_base/current_version/",
        file_name="ryukyuAI_001"
    )

    print(result)