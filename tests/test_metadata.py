def test_get_category_counter_success(
    client,
    monkeypatch
):

    from backend.routes import metadata

    class MockS3Get:

        def get_json(
            self,
            inside_folder,
            file_name
        ):

            return {
                "next_id": 3,
                "categories": [
                    {
                        "category_id": "knowviaAI_001",
                        "category_en": "After School",
                        "category_jp": "放課後"
                    }
                ]
            }

    monkeypatch.setattr(
        metadata,
        "S3Get",
        MockS3Get
    )

    response = client.get(
        "/api/metadata/category-counter"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["next_id"] == 3

    assert len(
        data["categories"]
    ) == 1

    assert (
        data["categories"][0]["category_id"]
        == "knowviaAI_001"
    )


def test_get_category_counter_failure(
    client,
    monkeypatch
):

    from backend.routes import metadata

    class MockS3Get:

        def get_json(
            self,
            inside_folder,
            file_name
        ):

            raise Exception(
                "S3 connection failed"
            )

    monkeypatch.setattr(
        metadata,
        "S3Get",
        MockS3Get
    )

    response = client.get(
        "/api/metadata/category-counter"
    )

    assert response.status_code == 404

    data = response.get_json()

    assert "error" in data


def test_update_category_counter_without_body(
    client
):

    response = client.put(
        "/api/metadata/category-counter",
        json={}
    )

    assert response.status_code == 400

    data = response.get_json()

    assert (
        data["error"]
        == "Request body is required."
    )


def test_update_category_counter_invalid_data(
    client
):

    response = client.put(
        "/api/metadata/category-counter",
        json=["invalid"]
    )

    assert response.status_code == 400

    data = response.get_json()

    assert (
        data["error"]
        == "Metadata must be a JSON object."
    )


def test_update_category_counter_success(
    client,
    monkeypatch
):

    from backend.routes import metadata

    class MockS3Upload:

        def upload_json(
            self,
            inside_folder,
            file_name,
            data
        ):

            return {
                "file": file_name,
                "status": "success"
            }

    monkeypatch.setattr(
        metadata,
        "S3Upload",
        MockS3Upload
    )

    response = client.put(
        "/api/metadata/category-counter",
        json={
            "next_id": 4,
            "categories": []
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert (
        data["message"]
        == "Category counter saved to S3 successfully."
    )

    assert "result" in data