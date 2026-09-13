import json

from botocore.exceptions import ClientError

from aws.s3_client import S3Client


class S3Upload:

    def __init__(self):

        self.s3 = S3Client()


    def upload_json(self,inside_folder: str,file_name: str,data: dict):

        json_file = inside_folder + file_name + ".json"
        


        try:

            self.s3.client.put_object(

                Bucket=self.s3.bucket_name,

                Key=json_file,

                Body=json.dumps(
                    data,
                    ensure_ascii=False,
                    indent=4
                ),

                ContentType="application/json"

            )


            return {
                "message": "Upload successful",
                "file": json_file
            }


        except ClientError as e:

            raise Exception(
                f"S3 upload error: {str(e)}"
            )


if __name__ == "__main__":

    s3_upload = S3Upload()


    data = {

        "test": "hello"

    }


    result = s3_upload.upload_json(

        inside_folder="vector_store/",

        file_name="test",

        data=data

    )


    print(result)