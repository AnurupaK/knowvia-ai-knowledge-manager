from flask import Blueprint, jsonify, request

from aws.config import config
from aws.s3_get import S3Get
from aws.s3_upload import S3Upload
from aws.s3_delete import S3Delete


metadata_bp = Blueprint(
    "metadata",
    __name__,
    url_prefix="/api/metadata"
)


# ========================================
# Fetch Category Counter
# ========================================

@metadata_bp.route(
    "/category-counter",
    methods=["GET"]
)
def get_category_counter():

    try:

        s3_get = S3Get()

        data = s3_get.get_json(
            inside_folder=config.METADATA_FOLDER,
            file_name="category_counter"
        )

        return jsonify(data), 200


    except Exception as e:

        print(
            f"Failed to fetch category counter: {e}"
        )

        return jsonify({
            "error": str(e)
        }), 404


# ========================================
# Save Category Counter
# ========================================

@metadata_bp.route(
    "/category-counter",
    methods=["PUT"]
)
def update_category_counter():

    try:

        data = request.get_json()


        if not data:

            return jsonify({
                "error": "Request body is required."
            }), 400


        if not isinstance(data, dict):

            return jsonify({
                "error": "Metadata must be a JSON object."
            }), 400


        s3_upload = S3Upload()


        result = s3_upload.upload_json(
            inside_folder=config.METADATA_FOLDER,
            file_name="category_counter",
            data=data
        )


        return jsonify({

            "message":
                "Category counter saved to S3 successfully.",

            "result":
                result

        }), 200


    except Exception as e:

        print(
            f"Failed to save category counter: {e}"
        )

        return jsonify({
            "error": str(e)
        }), 500


# ========================================
# Delete Category
# ========================================

@metadata_bp.route(
    "/category-counter/<category_id>",
    methods=["DELETE"]
)
def delete_category(category_id):

    try:

        s3_get = S3Get()
        s3_upload = S3Upload()
        s3_delete = S3Delete()


        # ----------------------------------------
        # Fetch current category counter
        # ----------------------------------------

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


        # ----------------------------------------
        # Find category
        # ----------------------------------------

        category_exists = any(
            category.get("category_id")
            == category_id
            for category in categories
        )


        if not category_exists:

            return jsonify({
                "error":
                    f"Category not found: {category_id}"
            }), 404


        # ----------------------------------------
        # Remove category from metadata
        # ----------------------------------------

        metadata["categories"] = [

            category

            for category in categories

            if category.get("category_id")
            != category_id

        ]


        # ----------------------------------------
        # Save updated category counter
        # ----------------------------------------

        metadata_result = s3_upload.upload_json(
            inside_folder=config.METADATA_FOLDER,
            file_name="category_counter",
            data=metadata
        )


        # ----------------------------------------
        # Delete Knowledge Base file
        # ----------------------------------------

        knowledge_result = s3_delete.delete_file(
            inside_folder=
                config.KNOWLEDGE_CURRENT_VERSION_FOLDER,

            file_name=category_id
        )


        # ----------------------------------------
        # Delete FAQ file
        # ----------------------------------------

        faq_result = s3_delete.delete_file(
            inside_folder=
                config.FAQ_CURRENT_VERSION_FOLDER,

            file_name=category_id
        )


        # ----------------------------------------
        # Return success
        # ----------------------------------------

        return jsonify({

            "message":
                "Category deleted successfully.",

            "category_id":
                category_id,

            "metadata_result":
                metadata_result,

            "knowledge_result":
                knowledge_result,

            "faq_result":
                faq_result

        }), 200


    except Exception as e:

        print(
            f"Failed to delete category "
            f"{category_id}: {e}"
        )

        return jsonify({
            "error": str(e)
        }), 500


# ========================================
# Fetch Knowledge Base Cards
# ========================================

@metadata_bp.route(
    "/knowledge-base-cards",
    methods=["GET"]
)
def get_knowledge_base_cards():

    try:

        s3_get = S3Get()

        data = s3_get.get_json(
            inside_folder=config.METADATA_FOLDER,
            file_name="knowledge_base_cards"
        )

        return jsonify(data), 200


    except Exception as e:

        print(
            f"Failed to fetch knowledge base cards: {e}"
        )

        return jsonify({
            "error": str(e)
        }), 404


# ========================================
# Save Knowledge Base Cards
# ========================================

@metadata_bp.route(
    "/knowledge-base-cards",
    methods=["PUT"]
)
def update_knowledge_base_cards():

    try:

        data = request.get_json()


        if not data:

            return jsonify({
                "error": "Request body is required."
            }), 400


        if not isinstance(data, dict):

            return jsonify({
                "error":
                    "Knowledge base cards "
                    "must be a JSON object."
            }), 400


        s3_upload = S3Upload()


        result = s3_upload.upload_json(
            inside_folder=config.METADATA_FOLDER,
            file_name="knowledge_base_cards",
            data=data
        )


        return jsonify({

            "message":
                "Knowledge base cards "
                "saved to S3 successfully.",

            "result":
                result

        }), 200


    except Exception as e:

        print(
            f"Failed to save knowledge base cards: {e}"
        )

        return jsonify({
            "error": str(e)
        }), 500


# ========================================
# Fetch Category Cards
# ========================================

@metadata_bp.route(
    "/category-cards",
    methods=["GET"]
)
def get_category_cards():

    try:

        s3_get = S3Get()

        data = s3_get.get_json(
            inside_folder=config.METADATA_FOLDER,
            file_name="category_cards"
        )

        return jsonify(data), 200


    except Exception as e:

        print(
            f"Failed to fetch category cards: {e}"
        )

        return jsonify({
            "error": str(e)
        }), 404


# ========================================
# Save Category Cards
# ========================================

@metadata_bp.route(
    "/category-cards",
    methods=["PUT"]
)
def update_category_cards():

    try:

        data = request.get_json()


        if not data:

            return jsonify({
                "error": "Request body is required."
            }), 400


        if not isinstance(data, dict):

            return jsonify({
                "error":
                    "Category cards "
                    "must be a JSON object."
            }), 400


        s3_upload = S3Upload()


        result = s3_upload.upload_json(
            inside_folder=config.METADATA_FOLDER,
            file_name="category_cards",
            data=data
        )


        return jsonify({

            "message":
                "Category cards "
                "saved to S3 successfully.",

            "result":
                result

        }), 200


    except Exception as e:

        print(
            f"Failed to save category cards: {e}"
        )

        return jsonify({
            "error": str(e)
        }), 500