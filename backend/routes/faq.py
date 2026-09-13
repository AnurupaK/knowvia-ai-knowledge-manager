from flask import Blueprint, jsonify, request

from aws.config import config
from aws.s3_get import S3Get
from aws.s3_upload import S3Upload

from ai_module.claude import ClaudeChat
from ai_module.prompt import build_faq_prompt
from ai_module.helper.extract_response import FAQResponseExtractor


faq_bp = Blueprint(
    "faq",
    __name__,
    url_prefix="/api/knowledge"
)


# ========================================
# Fetch FAQ
# ========================================

@faq_bp.route(
    "/categories/<category_id>/faq",
    methods=["GET"]
)
def get_faq(category_id):

    try:

        s3_get = S3Get()

        data = s3_get.get_json(
            inside_folder=
                config.FAQ_CURRENT_VERSION_FOLDER,
            file_name=category_id
        )

        print(data)

        return jsonify(data), 200

    except Exception as e:

        print(
            f"Failed to fetch FAQ "
            f"for category {category_id}: {e}"
        )

        return jsonify({
            "error": str(e)
        }), 404


# ========================================
# Generate FAQs with Claude
# ========================================

@faq_bp.route(
    "/generate-faqs",
    methods=["POST"]
)
def generate_faqs():

    category_id = None

    try:

        # ========================================
        # Get Request Data
        # ========================================

        data = request.get_json()

        if not data:

            return jsonify({
                "error":
                    "Request body is required."
            }), 400


        # ========================================
        # Get Category ID
        # ========================================

        category_id = data.get(
            "category_id"
        )

        if not category_id:

            return jsonify({
                "error":
                    "Category ID is required."
            }), 400


        # ========================================
        # Get FAQ Count
        # ========================================

        faq_count = data.get(
            "count"
        )

        if faq_count is None:

            return jsonify({
                "error":
                    "FAQ count is required."
            }), 400


        if (
            not isinstance(faq_count, int)
            or isinstance(faq_count, bool)
        ):

            return jsonify({
                "error":
                    "FAQ count must be an integer."
            }), 400


        if (
            faq_count < 1
            or faq_count > 20
        ):

            return jsonify({
                "error":
                    "FAQ count must be between 1 and 20."
            }), 400


        # ========================================
        # Fetch Whole Category JSON from S3
        # ========================================

        s3_get = S3Get()

        category_data = s3_get.get_json(
            inside_folder=
                config.KNOWLEDGE_CURRENT_VERSION_FOLDER,
            file_name=category_id
        )


        if not category_data:

            return jsonify({
                "error":
                    "Category data was not found."
            }), 404


        print(
            f"Category data fetched for "
            f"{category_id}:"
        )

        print(
            category_data
        )


        # ========================================
        # Build Claude Prompt
        # ========================================

        prompt = build_faq_prompt(
            category_data,
            faq_count
        )


        # ========================================
        # Generate FAQs with Claude
        # ========================================

        claude = ClaudeChat()

        response_text = claude.generate_answer(
            prompt
        )


        # ========================================
        # Extract FAQs
        # ========================================

        extractor = FAQResponseExtractor()

        faqs = extractor.extract_faqs(
            response_text
        )


        # ========================================
        # Validate Generated FAQ Count
        # ========================================

        if len(faqs) != faq_count:

            raise ValueError(
                f"Claude generated "
                f"{len(faqs)} FAQs, "
                f"but {faq_count} were requested."
            )


        # ========================================
        # Return Generated FAQs
        # ========================================

        return jsonify({

            "category_id":
                category_id,

            "faq_count":
                faq_count,

            "faqs":
                faqs

        }), 200


    except Exception as e:

        print(
            f"Failed to generate FAQs "
            f"for category {category_id}: {e}"
        )

        return jsonify({
            "error": str(e)
        }), 500


# ========================================
# Save FAQ
# ========================================

@faq_bp.route(
    "/categories/<category_id>/faq",
    methods=["PUT"]
)
def update_faq(category_id):

    try:

        # ========================================
        # Get Request Data
        # ========================================

        data = request.get_json()

        if not data:

            return jsonify({
                "error":
                    "Request body is required."
            }), 400


        if not isinstance(data, dict):

            return jsonify({
                "error":
                    "FAQ data must be a JSON object."
            }), 400


        # ========================================
        # Make Sure Category ID Is Correct
        # ========================================

        body_category_id = data.get(
            "category_id"
        )


        if (
            body_category_id
            and body_category_id != category_id
        ):

            return jsonify({
                "error":
                    "Category ID in request body "
                    "does not match URL."
            }), 400


        # Always use URL Category ID

        data["category_id"] = category_id


        # ========================================
        # Validate FAQ List
        # ========================================

        faqs = data.get(
            "faqs"
        )


        if faqs is None:

            return jsonify({
                "error":
                    "'faqs' field is required."
            }), 400


        if not isinstance(faqs, list):

            return jsonify({
                "error":
                    "'faqs' must be a list."
            }), 400


        # ========================================
        # Create S3 Helper
        # ========================================

        s3_upload = S3Upload()


        # ========================================
        # Save FAQ JSON
        # ========================================

        result = s3_upload.upload_json(
            inside_folder=
                config.FAQ_CURRENT_VERSION_FOLDER,
            file_name=category_id,
            data=data
        )


        # ========================================
        # Return Success
        # ========================================

        return jsonify({

            "message":
                "FAQ data saved to S3 successfully.",

            "category_id":
                category_id,

            "faq_count":
                len(faqs),

            "result":
                result

        }), 200


    except Exception as e:

        print(
            f"Failed to upload FAQ "
            f"for category {category_id}: {e}"
        )

        return jsonify({
            "error": str(e)
        }), 500