import json

from aws.bedrock_client import BedrockClient


class ClaudeChat:

    def __init__(self):

        self.bedrock = BedrockClient()

        self.model_id = (
            "jp.anthropic.claude-haiku-4-5-20251001-v1:0"
        )


    # ========================================
    # Generate Answer
    # ========================================

    def generate_answer(
        self,
        prompt: str
    ):

        try:

            body = json.dumps({

                "anthropic_version":
                    "bedrock-2023-05-31",

                "max_tokens":
                    4000,

                "messages": [

                    {
                        "role":
                            "user",

                        "content":
                            prompt
                    }

                ]

            })


            response = (
                self.bedrock.client.invoke_model(

                    modelId=
                        self.model_id,

                    body=
                        body,

                    contentType=
                        "application/json",

                    accept=
                        "application/json"

                )
            )


            response_body = json.loads(

                response["body"]
                .read()
                .decode("utf-8")

            )


            return (
                response_body
                ["content"][0]["text"]
            )


        except Exception as e:

            raise Exception(
                f"Claude generation failed: {str(e)}"
            )


# ========================================
# Test
# ========================================

if __name__ == "__main__":

    claude = ClaudeChat()


    prompt = """
You are a helpful assistant.

Generate one FAQ in JSON format.

Context:
Summer school starts on July 20.

Return only valid JSON.
"""


    answer = claude.generate_answer(
        prompt
    )


    print(answer)