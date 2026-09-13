/* ========================================
   API
   ======================================== */

const FETCH_URL =
    "/api/metadata/category-counter";

const SAVE_URL =
    "/api/metadata/category-counter";


/* ========================================
   LOCAL STORAGE
   ======================================== */

const STORAGE_KEY =
    "category_counter_metadata";


/* ========================================
   STATE
   ======================================== */

let metadata = {

    next_id: 0,

    categories: []

};


/* ========================================
   LOAD METADATA
   ======================================== */

export async function loadMetadata() {

    try {

        const response =
            await fetch(
                "/static/components/metadata.html"
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load metadata page."
            );

        }


        const html =
            await response.text();


        document.getElementById(
            "main-content"
        ).innerHTML = html;


        setupMetadata();


    } catch (error) {

        console.error(
            "Metadata page error:",
            error
        );

    }

}


/* ========================================
   SETUP
   ======================================== */

function setupMetadata() {

    setupButtons();

    renderMetadata();

}


/* ========================================
   BUTTONS
   ======================================== */

function setupButtons() {

    document
        .getElementById(
            "fetch-from-s3-btn"
        )
        .addEventListener(
            "click",
            fetchFromS3
        );


    document
        .getElementById(
            "save-to-s3-btn"
        )
        .addEventListener(
            "click",
            saveToS3
        );


    document
        .getElementById(
            "save-btn"
        )
        .addEventListener(
            "click",
            saveNormal
        );


    document
        .getElementById(
            "add-category-btn"
        )
        .addEventListener(
            "click",
            addCategory
        );


    document
        .getElementById(
            "next-id"
        )
        .addEventListener(
            "input",
            updateNextId
        );

}


/* ========================================
   FETCH FROM S3
   ======================================== */

async function fetchFromS3() {

    const button =
        document.getElementById(
            "fetch-from-s3-btn"
        );


    try {

        button.disabled = true;

        button.textContent =
            "Fetching...";


        showStatus(
            "Fetching metadata from S3...",
            "info"
        );


        const response =
            await fetch(
                FETCH_URL
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Failed to fetch metadata."
            );

        }


        metadata =
            normalizeMetadata(
                data
            );


        renderMetadata();


        showStatus(
            "Metadata fetched successfully from S3.",
            "success"
        );


    } catch (error) {

        console.error(
            "Fetch metadata error:",
            error
        );


        showStatus(
            error.message ||
            "Failed to fetch metadata.",
            "error"
        );

    } finally {

        button.disabled = false;

        button.textContent =
            "Fetch from S3";

    }

}


/* ========================================
   SAVE TO S3
   ======================================== */

async function saveToS3() {

    const button =
        document.getElementById(
            "save-to-s3-btn"
        );


    try {

        updateMetadataFromDOM();

        validateMetadata();


        button.disabled = true;

        button.textContent =
            "Saving...";


        showStatus(
            "Saving metadata to S3...",
            "info"
        );


        const response =
            await fetch(
                SAVE_URL,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            metadata
                        )
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Failed to save metadata."
            );

        }


        showStatus(
            "Metadata saved to S3 successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Save to S3 error:",
            error
        );


        showStatus(
            error.message ||
            "Failed to save metadata to S3.",
            "error"
        );

    } finally {

        button.disabled = false;

        button.textContent =
            "Save to S3";

    }

}


/* ========================================
   NORMAL SAVE
   ======================================== */

function saveNormal() {

    try {

        updateMetadataFromDOM();

        validateMetadata();


        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                metadata
            )
        );


        showStatus(
            "Metadata saved locally.",
            "success"
        );


    } catch (error) {

        console.error(
            "Local save error:",
            error
        );


        showStatus(
            error.message ||
            "Failed to save metadata.",
            "error"
        );

    }

}


/* ========================================
   ADD CATEGORY
   ======================================== */

function addCategory() {

    updateMetadataFromDOM();


    try {

        validateMetadataNextId();

    } catch (error) {

        showStatus(
            error.message,
            "error"
        );

        return;

    }


    const categoryId =
        generateCategoryId(
            metadata.next_id
        );


    /*
        Prevent duplicate Category IDs.
    */

    const duplicate =
        metadata.categories.some(
            category =>
                category.category_id ===
                categoryId
        );


    if (duplicate) {

        showStatus(
            `Category ID ${categoryId} already exists. Please update the Next ID.`,
            "error"
        );

        return;

    }


    metadata.categories.push({

        category_id:
            categoryId,

        category_en:
            "",

        category_jp:
            ""

    });


    metadata.next_id += 1;


    renderMetadata();


    showStatus(
        `${categoryId} created.`,
        "success"
    );

}


/* ========================================
   DELETE CATEGORY
   ======================================== */

async function deleteCategory(index) {

    const category =
        metadata.categories[index];


    if (!category) {

        return;

    }


    const categoryId =
        category.category_id;


    const name =
        category.category_en ||
        categoryId;


    const confirmed =
        window.confirm(
            `Delete "${name}"?\n\n` +
            `This will delete the category from the registry ` +
            `and remove its Knowledge Base and FAQ files from S3.`
        );


    if (!confirmed) {

        return;

    }


    try {

        showStatus(
            `Deleting ${categoryId}...`,
            "info"
        );


        const response =
            await fetch(
                `${SAVE_URL}/${encodeURIComponent(categoryId)}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                `Failed to delete ${categoryId}.`
            );

        }


        /*
            Only update the frontend state
            after the backend deletion succeeds.
        */

        metadata.categories.splice(
            index,
            1
        );


        renderMetadata();


        showStatus(
            `${categoryId} deleted successfully.`,
            "success"
        );


    } catch (error) {

        console.error(
            "Delete category error:",
            error
        );


        showStatus(
            error.message ||
            `Failed to delete ${categoryId}.`,
            "error"
        );

    }

}


/* ========================================
   UPDATE NEXT ID
   ======================================== */

function updateNextId(event) {

    const value =
        event.target.value.trim();


    /*
        Allow the user to temporarily
        clear the field while editing.
    */

    if (!value) {

        metadata.next_id =
            null;

        event.target.classList.add(
            "metadata-input-error"
        );

        return;

    }


    const nextId =
        Number(value);


    if (
        Number.isInteger(nextId) &&
        nextId >= 0
    ) {

        metadata.next_id =
            nextId;

        event.target.classList.remove(
            "metadata-input-error"
        );

        return;

    }


    metadata.next_id =
        null;

    event.target.classList.add(
        "metadata-input-error"
    );

}


/* ========================================
   UPDATE METADATA FROM DOM
   ======================================== */

function updateMetadataFromDOM() {

    const nextIdInput =
        document.getElementById(
            "next-id"
        );


    if (!nextIdInput) {

        return;

    }


    const value =
        nextIdInput.value.trim();


    /*
        Do not silently ignore a blank value.
    */

    if (!value) {

        metadata.next_id =
            null;

        return;

    }


    const nextId =
        Number(value);


    if (
        Number.isInteger(nextId) &&
        nextId >= 0
    ) {

        metadata.next_id =
            nextId;

    } else {

        metadata.next_id =
            null;

    }

}


/* ========================================
   RENDER METADATA
   ======================================== */

function renderMetadata() {

    const nextIdInput =
        document.getElementById(
            "next-id"
        );


    const tableBody =
        document.getElementById(
            "category-table-body"
        );


    const emptyState =
        document.getElementById(
            "empty-category-state"
        );


    if (
        !nextIdInput ||
        !tableBody
    ) {

        return;

    }


    nextIdInput.value =
        metadata.next_id ?? "";


    nextIdInput.classList.remove(
        "metadata-input-error"
    );


    tableBody.innerHTML = "";


    if (
        !metadata.categories ||
        metadata.categories.length === 0
    ) {

        if (emptyState) {

            emptyState.style.display =
                "block";

        }

        return;

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    metadata.categories.forEach(
        (category, index) => {

            const row =
                createCategoryRow(
                    category,
                    index
                );


            tableBody.appendChild(
                row
            );

        }
    );

}


/* ========================================
   CREATE CATEGORY ROW
   ======================================== */

function createCategoryRow(
    category,
    index
) {

    const row =
        document.createElement(
            "tr"
        );


    /* ------------------------------------
       Category ID
       ------------------------------------ */

    const idCell =
        document.createElement(
            "td"
        );


    const idInput =
        document.createElement(
            "input"
        );


    idInput.type =
        "text";


    idInput.value =
        category.category_id || "";


    idInput.className =
        "metadata-id-input";


    idInput.readOnly =
        true;


    idCell.appendChild(
        idInput
    );


    /* ------------------------------------
       Category EN
       ------------------------------------ */

    const enCell =
        document.createElement(
            "td"
        );


    const enInput =
        document.createElement(
            "input"
        );


    enInput.type =
        "text";


    enInput.value =
        category.category_en || "";


    enInput.placeholder =
        "Category name in English";


    enInput.addEventListener(
        "input",
        () => {

            metadata.categories[index]
                .category_en =
                enInput.value;

        }
    );


    enCell.appendChild(
        enInput
    );


    /* ------------------------------------
       Category JP
       ------------------------------------ */

    const jpCell =
        document.createElement(
            "td"
        );


    const jpInput =
        document.createElement(
            "input"
        );


    jpInput.type =
        "text";


    jpInput.value =
        category.category_jp || "";


    jpInput.placeholder =
        "Category name in Japanese";


    jpInput.addEventListener(
        "input",
        () => {

            metadata.categories[index]
                .category_jp =
                jpInput.value;

        }
    );


    jpCell.appendChild(
        jpInput
    );


    /* ------------------------------------
       Actions
       ------------------------------------ */

    const actionCell =
        document.createElement(
            "td"
        );


    actionCell.className =
        "metadata-actions-column";


    const deleteButton =
        document.createElement(
            "button"
        );


    deleteButton.type =
        "button";


    deleteButton.className =
        "metadata-delete-btn";


    deleteButton.textContent =
        "Delete";


    deleteButton.addEventListener(
        "click",
        () => {

            deleteCategory(index);

        }
    );


    actionCell.appendChild(
        deleteButton
    );


    /* ------------------------------------
       Add cells
       ------------------------------------ */

    row.appendChild(
        idCell
    );


    row.appendChild(
        enCell
    );


    row.appendChild(
        jpCell
    );


    row.appendChild(
        actionCell
    );


    return row;

}


/* ========================================
   GENERATE CATEGORY ID
   ======================================== */

function generateCategoryId(number) {

    return (
        "ryukyuAI_" +
        String(number).padStart(
            3,
            "0"
        )
    );

}


/* ========================================
   NORMALIZE METADATA
   ======================================== */

function normalizeMetadata(data) {

    if (
        !data ||
        typeof data !== "object"
    ) {

        throw new Error(
            "Invalid metadata received."
        );

    }


    const nextId =
        parseInt(
            data.next_id,
            10
        );


    const categories =
        Array.isArray(
            data.categories
        )
            ? data.categories
            : [];


    return {

        next_id:
            Number.isInteger(nextId) &&
            nextId >= 0
                ? nextId
                : 0,

        categories:
            categories.map(
                category => ({

                    category_id:
                        category.category_id ||
                        "",

                    category_en:
                        category.category_en ||
                        "",

                    category_jp:
                        category.category_jp ||
                        ""

                })
            )

    };

}


/* ========================================
   VALIDATE NEXT ID
   ======================================== */

function validateMetadataNextId() {

    const nextIdInput =
        document.getElementById(
            "next-id"
        );


    if (
        !nextIdInput ||
        !nextIdInput.value.trim()
    ) {

        if (nextIdInput) {

            nextIdInput.classList.add(
                "metadata-input-error"
            );

            nextIdInput.focus();

        }


        throw new Error(
            "Next ID cannot be left blank."
        );

    }


    const nextId =
        Number(
            nextIdInput.value.trim()
        );


    if (
        !Number.isInteger(nextId) ||
        nextId < 0
    ) {

        nextIdInput.classList.add(
            "metadata-input-error"
        );

        nextIdInput.focus();


        throw new Error(
            "Next ID must be a whole number greater than or equal to 0."
        );

    }


    nextIdInput.classList.remove(
        "metadata-input-error"
    );


    metadata.next_id =
        nextId;

}


/* ========================================
   VALIDATE METADATA
   ======================================== */

function validateMetadata() {

    /*
        Validate Next ID first.
    */

    validateMetadataNextId();


    /*
        Validate categories.
    */

    if (
        !Array.isArray(
            metadata.categories
        )
    ) {

        throw new Error(
            "Categories must be an array."
        );

    }


    const ids =
        new Set();


    metadata.categories.forEach(
        (category, index) => {

            if (
                !category.category_id
            ) {

                throw new Error(
                    `Category ${index + 1} is missing a Category ID.`
                );

            }


            if (
                ids.has(
                    category.category_id
                )
            ) {

                throw new Error(
                    `Duplicate Category ID: ${category.category_id}`
                );

            }


            ids.add(
                category.category_id
            );


            if (
                !category.category_en ||
                !category.category_en.trim()
            ) {

                throw new Error(
                    `${category.category_id} is missing Category EN.`
                );

            }

        }
    );

}


/* ========================================
   SHOW STATUS
   ======================================== */

function showStatus(
    message,
    type
) {

    const status =
        document.getElementById(
            "metadata-status"
        );


    if (!status) {

        return;

    }


    /*
        Clear previous message.
    */

    status.innerHTML = "";


    /*
        Create message.
    */

    const messageElement =
        document.createElement(
            "span"
        );


    messageElement.className =
        "metadata-status-message";


    messageElement.textContent =
        message;


    /*
        Create close button.
    */

    const closeButton =
        document.createElement(
            "button"
        );


    closeButton.type =
        "button";


    closeButton.className =
        "metadata-status-close";


    closeButton.setAttribute(
        "aria-label",
        "Close message"
    );


    closeButton.textContent =
        "×";


    /*
        Close the status message.
    */

    closeButton.onclick =
        function () {

            status.hidden =
                true;

            status.style.display =
                "none";

        };


    /*
        Add elements.
    */

    status.appendChild(
        messageElement
    );


    status.appendChild(
        closeButton
    );


    /*
        Apply status type.
    */

    status.className =
        `metadata-status ${type}`;


    /*
        Make sure the status is visible.
    */

    status.hidden =
        false;

    status.style.display =
        "flex";

}