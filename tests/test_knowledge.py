def test_get_category_success(
    client,
    monkeypatch
):

    from backend.routes import knowledge

    class MockS3Get:

        def get_json(
            self,
            inside_folder,
            file_name
        ):

            return {
                "Category_ID": "knowviaAI_001",
                "Category_EN": "After School",
                "Category_JP": "放課後"
            }

    monkeypatch.setattr(
        knowledge,
        "S3Get",
        MockS3Get
    )

    response = client.get(
        "/api/knowledge/categories/knowviaAI_001"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert (
        data["Category_ID"]
        == "knowviaAI_001"
    )

    assert (
        data["Category_EN"]
        == "After School"
    )


def test_get_category_failure(
    client,
    monkeypatch
):

    from backend.routes import knowledge

    class MockS3Get:

        def get_json(
            self,
            inside_folder,
            file_name
        ):

            raise Exception(
                "Category not found"
            )

    monkeypatch.setattr(
        knowledge,
        "S3Get",
        MockS3Get
    )

    response = client.get(
        "/api/knowledge/categories/knowviaAI_001"
    )

    assert response.status_code == 404

    data = response.get_json()

    assert "error" in data


def test_update_category_without_body(
    client
):

    response = client.put(
        "/api/knowledge/categories/knowviaAI_001",
        json={}
    )

    assert response.status_code == 400

    data = response.get_json()

    assert (
        data["error"]
        == "Request body is required."
    )


def test_update_category_id_mismatch(
    client
):

    response = client.put(
        "/api/knowledge/categories/knowviaAI_001",
        json={
            "Category_ID": "knowviaAI_999",
            "Category_EN": "After School"
        }
    )

    assert response.status_code == 400

    data = response.get_json()

    assert (
        data["error"]
        == "Category ID in request body "
           "does not match URL."
    )