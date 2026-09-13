import json
import re


class FAQResponseExtractor:

    def __init__(self):
        pass


    # ========================================
    # Extract FAQs
    # ========================================

    def extract_faqs(
        self,
        response_text
    ):

        if not response_text:

            raise ValueError(
                "Claude returned an empty response."
            )


        # ========================================
        # Clean Response
        # ========================================

        cleaned_response = (
            response_text
            .strip()
        )


        # Remove Markdown code fences
        cleaned_response = re.sub(
            r"^```json\s*",
            "",
            cleaned_response,
            flags=re.IGNORECASE
        )

        cleaned_response = re.sub(
            r"^```\s*",
            "",
            cleaned_response
        )

        cleaned_response = re.sub(
            r"\s*```$",
            "",
            cleaned_response
        )


        cleaned_response = (
            cleaned_response
            .strip()
        )


        # ========================================
        # Parse JSON
        # ========================================

        try:

            generated_data = json.loads(
                cleaned_response
            )


        except json.JSONDecodeError:

            # ========================================
            # Try JSON Array
            # ========================================

            array_match = re.search(
                r"\[[\s\S]*\]",
                cleaned_response
            )


            if array_match:

                try:

                    generated_data = json.loads(
                        array_match.group(0)
                    )

                except json.JSONDecodeError as e:

                    print(
                        "Claude returned invalid JSON:"
                    )

                    print(
                        response_text
                    )

                    raise ValueError(
                        "Claude returned invalid JSON."
                    ) from e


            else:

                # ========================================
                # Try JSON Object
                # ========================================

                object_match = re.search(
                    r"\{[\s\S]*\}",
                    cleaned_response
                )


                if object_match:

                    try:

                        generated_data = json.loads(
                            object_match.group(0)
                        )

                    except json.JSONDecodeError as e:

                        print(
                            "Claude returned invalid JSON:"
                        )

                        print(
                            response_text
                        )

                        raise ValueError(
                            "Claude returned invalid JSON."
                        ) from e

                else:

                    print(
                        "Claude returned invalid JSON:"
                    )

                    print(
                        response_text
                    )

                    raise ValueError(
                        "Claude returned invalid JSON."
                    )


        # ========================================
        # Get FAQ List
        # ========================================

        if isinstance(
            generated_data,
            dict
        ):

            # Format:
            #
            # {
            #     "faqs": [...]
            # }

            if isinstance(
                generated_data.get("faqs"),
                list
            ):

                faqs = generated_data["faqs"]


            # Format:
            #
            # {
            #     "id": "faq_001",
            #     "question_en": "...",
            #     ...
            # }

            elif (
                "question_en"
                in generated_data
            ):

                faqs = [
                    generated_data
                ]


            else:

                faqs = []


        elif isinstance(
            generated_data,
            list
        ):

            faqs = generated_data


        else:

            raise ValueError(
                "Invalid FAQ response format."
            )


        # ========================================
        # Validate FAQ List
        # ========================================

        if not isinstance(
            faqs,
            list
        ):

            raise ValueError(
                "Generated FAQs must be a list."
            )


        # ========================================
        # Normalize FAQs
        # ========================================

        normalized_faqs = []


        for index, faq in enumerate(
            faqs,
            start=1
        ):

            if not isinstance(
                faq,
                dict
            ):

                continue


            follow_ups = faq.get(
                "follow_ups",
                []
            )


            if not isinstance(
                follow_ups,
                list
            ):

                follow_ups = []


            normalized_faqs.append({

                "id":
                    f"faq_{index:03d}",

                "question_en":
                    str(
                        faq.get(
                            "question_en",
                            ""
                        )
                    ).strip(),

                "question_jp":
                    str(
                        faq.get(
                            "question_jp",
                            ""
                        )
                    ).strip(),

                "answer_en":
                    str(
                        faq.get(
                            "answer_en",
                            ""
                        )
                    ).strip(),

                "answer_jp":
                    str(
                        faq.get(
                            "answer_jp",
                            ""
                        )
                    ).strip(),

                "follow_ups":
                    follow_ups

            })


        # ========================================
        # Validate Result
        # ========================================

        if not normalized_faqs:

            raise ValueError(
                "Claude did not generate any FAQs."
            )


        return normalized_faqs