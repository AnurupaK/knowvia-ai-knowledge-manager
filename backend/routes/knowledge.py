from flask import Blueprint, jsonify, request

from aws.config import config
from aws.s3_get import S3Get
from aws.s3_upload import S3Upload


knowledge_bp = Blueprint(
    "knowledge",
    __name__,
    url_prefix="/api/knowledge"
)


@knowledge_bp.route(
    "/categories/<category_id>",
    methods=["GET"]
)
def get_category(category_id):

    try:

        s3_get = S3Get()

        data = s3_get.get_json(
            inside_folder=config.KNOWLEDGE_CURRENT_VERSION_FOLDER,
            file_name=category_id
        )

        print(data)

        return jsonify(data), 200

    except Exception as e:

        print(
            f"Failed to fetch category "
            f"{category_id}: {e}"
        )

        return jsonify({
            "error": str(e)
        }), 404


@knowledge_bp.route(
    "/categories/<category_id>",
    methods=["PUT"]
)
def update_category(category_id):

    try:

        # ========================================
        # Get request data
        # ========================================

        data = request.get_json()

        if not data:

            return jsonify({
                "error": "Request body is required."
            }), 400


        if not isinstance(data, dict):

            return jsonify({
                "error": "Category data must be a JSON object."
            }), 400


        # ========================================
        # Make sure Category_ID is correct
        # ========================================

        body_category_id = data.get("Category_ID")

        if (
            body_category_id
            and body_category_id != category_id
        ):

            return jsonify({
                "error":
                    "Category ID in request body "
                    "does not match URL."
            }), 400


        # Always use the URL category ID
        data["Category_ID"] = category_id


        # ========================================
        # Create S3 helpers
        # ========================================

        s3_get = S3Get()
        s3_upload = S3Upload()


        # ========================================
        # Get category counter metadata
        # ========================================

        metadata = s3_get.get_json(
            inside_folder=config.METADATA_FOLDER,
            file_name="category_counter"
        )


        categories = metadata.get(
            "categories",
            []
        )


        if not isinstance(categories, list):

            return jsonify({
                "error":
                    "Invalid category counter format. "
                    "'categories' must be a list."
            }), 500


        # ========================================
        # Check if category already exists
        # ========================================

        existing_category = None

        for category in categories:

            if (
                category.get("category_id")
                == category_id
            ):

                existing_category = category
                break


        is_new_category = (
            existing_category is None
        )


        # ========================================
        # Save category JSON
        # ========================================

        category_result = s3_upload.upload_json(
            inside_folder=
                config.KNOWLEDGE_CURRENT_VERSION_FOLDER,
            file_name=category_id,
            data=data
        )


        # ========================================
        # Update category metadata
        # ========================================

        if is_new_category:

            # ------------------------------------
            # New category
            # ------------------------------------

            categories.append({
                "category_id": category_id,
                "category_en":
                    data.get("Category_EN", ""),
                "category_jp":
                    data.get("Category_JP", "")
            })


            # Increment next_id
            next_id = metadata.get(
                "next_id",
                1
            )


            if not isinstance(next_id, int):

                return jsonify({
                    "error":
                        "Invalid category counter format. "
                        "'next_id' must be an integer."
                }), 500


            metadata["next_id"] = (
                next_id + 1
            )


        else:

            # ------------------------------------
            # Existing category
            # ------------------------------------

            # Update names in metadata
            # without creating a duplicate
            # and without incrementing next_id.

            existing_category["category_en"] = (
                data.get("Category_EN", "")
            )

            existing_category["category_jp"] = (
                data.get("Category_JP", "")
            )


        # Make sure updated list is stored
        metadata["categories"] = categories


        # ========================================
        # Save category counter metadata
        # ========================================

        metadata_result = s3_upload.upload_json(
            inside_folder=config.METADATA_FOLDER,
            file_name="category_counter",
            data=metadata
        )


        # ========================================
        # Return success
        # ========================================

        return jsonify({

            "message":
                "Category and metadata "
                "saved to S3 successfully.",

            "category_id":
                category_id,

            "is_new_category":
                is_new_category,

            "category_result":
                category_result,

            "metadata_result":
                metadata_result

        }), 200


    except Exception as e:

        print(
            f"Failed to upload category "
            f"{category_id}: {e}"
        )

        return jsonify({
            "error": str(e)
        }), 500