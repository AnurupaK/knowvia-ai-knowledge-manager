def test_get_faq_success(
    client,
    monkeypatch
):

    from backend.routes import faq

    class MockS3Get:

        def get_json(
            self,
            inside_folder,
            file_name
        ):

            return {
                "category_id": "knowviaAI_001",
                "faqs": [
                    {
                        "id": "faq_001",
                        "question_en":
                            "What is After School?",
                        "answer_en":
                            "It is an after-school program."
                    }
                ]
            }

    monkeypatch.setattr(
        faq,
        "S3Get",
        MockS3Get
    )

    response = client.get(
        "/api/knowledge/categories/"
        "knowviaAI_001/faq"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert (
        data["category_id"]
        == "knowviaAI_001"
    )

    assert len(
        data["faqs"]
    ) == 1


def test_get_faq_failure(
    client,
    monkeypatch
):

    from backend.routes import faq

    class MockS3Get:

        def get_json(
            self,
            inside_folder,
            file_name
        ):

            raise Exception(
                "FAQ not found"
            )

    monkeypatch.setattr(
        faq,
        "S3Get",
        MockS3Get
    )

    response = client.get(
        "/api/knowledge/categories/"
        "knowviaAI_001/faq"
    )

    assert response.status_code == 404

    data = response.get_json()

    assert "error" in data


def test_update_faq_without_body(
    client
):

    response = client.put(
        "/api/knowledge/categories/"
        "knowviaAI_001/faq",
        json={}
    )

    assert response.status_code == 400

    data = response.get_json()

    assert (
        data["error"]
        == "Request body is required."
    )


def test_update_faq_category_id_mismatch(
    client
):

    response = client.put(
        "/api/knowledge/categories/"
        "knowviaAI_001/faq",
        json={
            "category_id": "knowviaAI_999",
            "faqs": []
        }
    )

    assert response.status_code == 400

    data = response.get_json()

    assert (
        data["error"]
        == "Category ID in request body "
           "does not match URL."
    )


def test_update_faq_missing_faqs(
    client
):

    response = client.put(
        "/api/knowledge/categories/"
        "knowviaAI_001/faq",
        json={
            "category_id": "knowviaAI_001"
        }
    )

    assert response.status_code == 400

    data = response.get_json()

    assert (
        data["error"]
        == "'faqs' field is required."
    )