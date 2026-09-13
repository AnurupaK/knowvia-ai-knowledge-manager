/* ========================================
   Category Content Page
   ======================================== */

let currentParentCategory = null;
let currentSubcategory = null;

let isExistingCategory = false;
let categoryCheckPassed = false;


/* ========================================
   Load Category Content Page
   ======================================== */

export async function loadCategoryContentPage(
    parentCategory,
    subcategory
) {

    currentParentCategory =
        parentCategory;

    currentSubcategory =
        subcategory;


    console.log(
        "Category Content Page received:",
        currentSubcategory
    );


    /*
        Existing category:
            - Category ID exists
            - isNew is false or not provided

        New category:
            - isNew is true

        IMPORTANT:
        isNew takes priority even if a generated
        Category ID has already been provided.
    */
    isExistingCategory =
        Boolean(
            currentSubcategory?.id
        ) &&
        !currentSubcategory?.isNew;


    console.log(
        "isExistingCategory:",
        isExistingCategory
    );


    categoryCheckPassed =
        false;


    const response =
        await fetch(
            "/static/components/category-content-page.html"
        );


    if (!response.ok) {

        throw new Error(
            `Failed to load category-content-page.html: ${response.status}`
        );

    }


    const html =
        await response.text();


    document.getElementById(
        "main-content"
    ).innerHTML =
        html;


    document.getElementById(
        "category-content-title"
    ).textContent =
        currentSubcategory?.name ||
        "New Category";


    document.getElementById(
        "category-content-subtitle"
    ).textContent =
        currentSubcategory?.name
            ? `Manage ${currentSubcategory.name} information.`
            : "Create a new category";


    setupCategoryContentPage();


    /*
        ========================================
        EXISTING CATEGORY
        ========================================

        Automatically fetch the category
        content from S3.

        IMPORTANT:
        Fetching S3 does NOT pass the
        Category Check.

        The user must still click Check.
    */
    if (isExistingCategory) {

        console.log(
            "Existing Category ID:",
            currentSubcategory.id
        );


        document.getElementById(
            "category-id"
        ).value =
            currentSubcategory.id;


        showCheckButton();


        setCategoryEditorLocked(
            true
        );


        await fetchFromS3(
            currentSubcategory.id,
            true
        );


        return;
    }


    /*
        ========================================
        NEW CATEGORY
        ========================================
    */

    console.log(
        "Opening New Category flow:",
        currentSubcategory
    );


    showCheckButton();


    populateForm(
        createEmptyCategory()
    );


    document.getElementById(
        "category-id"
    ).value =
        currentSubcategory?.id ||
        "";


    document.getElementById(
        "category-en"
    ).value =
        currentSubcategory?.name ||
        "";


    setCategoryEditorLocked(
        true
    );


    showStatus(
        `This is a new entry. A new Category ID has been provided: ${
            currentSubcategory?.id ||
            "Please provide an ID"
        }.`,
        "info"
    );


    showCategoryCheckStatus(
        "Please click Check to verify the category before editing.",
        "info"
    );

}


/* ========================================
   Setup
   ======================================== */

function setupCategoryContentPage() {

    /*
        Back
    */
    document
        .getElementById(
            "back-to-manage"
        )
        .addEventListener(
            "click",
            goBack
        );


    /*
        Check
    */
    const checkButton =
        document.getElementById(
            "check-category-btn"
        );


    if (checkButton) {

        checkButton.addEventListener(
            "click",
            checkCategory
        );

    }


    /*
        Category information changed
    */
    [
        "category-id",
        "category-en",
        "category-jp"
    ]
        .forEach(
            elementId => {

                const element =
                    document.getElementById(
                        elementId
                    );


                if (!element) {
                    return;
                }


                element.addEventListener(
                    "input",
                    () => {

                        categoryCheckPassed =
                            false;


                        setCategoryEditorLocked(
                            true
                        );


                        showCategoryCheckStatus(
                            "Category information changed. Please click Check again.",
                            "info"
                        );

                    }
                );

            }
        );


    /*
        Save
    */
    document
        .getElementById(
            "save-category-content-btn"
        )
        .addEventListener(
            "click",
            saveCategory
        );


    /*
        Preview
    */
    const previewButton =
        document.getElementById(
            "preview-btn"
        );


    if (previewButton) {

        previewButton.addEventListener(
            "click",
            previewCategory
        );

    }


    /*
        Add Key Information
    */
    const addKeyInformationButton =
        document.getElementById(
            "add-key-information-btn"
        );


    if (addKeyInformationButton) {

        addKeyInformationButton.addEventListener(
            "click",
            addKeyInformationField
        );

    }


    /*
        Add Media
    */
    const addMediaButton =
        document.getElementById(
            "add-media-btn"
        );


    if (addMediaButton) {

        addMediaButton.addEventListener(
            "click",
            addMediaField
        );

    }


    /*
        Manual Fetch from S3
    */
    const fetchButton =
        document.getElementById(
            "fetch-from-s3-btn"
        );


    if (fetchButton) {

        fetchButton.addEventListener(
            "click",
            () =>
                fetchFromS3(
                    null,
                    false
                )
        );

    }


    /*
        Send to S3
    */
    document
        .getElementById(
            "send-to-s3-btn"
        )
        .addEventListener(
            "click",
            sendToS3
        );

}


/* ========================================
   Show / Hide Check Button
   ======================================== */

function hideCheckButton() {

    const button =
        document.getElementById(
            "check-category-btn"
        );


    if (!button) {
        return;
    }


    button.hidden =
        true;

}


function showCheckButton() {

    const button =
        document.getElementById(
            "check-category-btn"
        );


    if (!button) {
        return;
    }


    button.hidden =
        false;

}


/* ========================================
   Lock / Unlock Editor
   ======================================== */

function setCategoryEditorLocked(
    locked
) {

    const panel =
        document.querySelector(
            ".category-editor-panel"
        );


    if (!panel) {
        return;
    }


    panel.classList.toggle(
        "locked",
        locked
    );


    const sections =
        panel.querySelectorAll(
            ".category-section"
        );


    sections.forEach(
        (
            section,
            index
        ) => {

            /*
                Basic Information is always
                editable.

                All sections after Basic
                Information are locked until
                verification.
            */
            if (index === 0) {
                return;
            }


            section
                .querySelectorAll(
                    "input, textarea, select, button"
                )
                .forEach(
                    element => {

                        element.disabled =
                            locked;

                    }
                );

        }
    );

}


/* ========================================
   Check Category
   ======================================== */

async function checkCategory() {

    const categoryId =
        document
            .getElementById(
                "category-id"
            )
            .value
            .trim();


    const categoryEn =
        document
            .getElementById(
                "category-en"
            )
            .value
            .trim();


    const categoryJp =
        document
            .getElementById(
                "category-jp"
            )
            .value
            .trim();


    /*
        Category ID is required.
    */
    if (!categoryId) {

        showCategoryCheckStatus(
            "Please enter a Category ID.",
            "error"
        );

        return;
    }


    /*
        English category name is required.
    */
    if (!categoryEn) {

        showCategoryCheckStatus(
            "Please enter the Category Name (English).",
            "error"
        );

        return;
    }


    try {

        /*
            IMPORTANT:

            Check ONLY category-counter.json.

            No S3 category-content request
            happens here.
        */
        showCategoryCheckStatus(
            "Checking category registry...",
            "info"
        );


        const metadataResponse =
            await fetch(
                "/api/metadata/category-counter"
            );


        if (!metadataResponse.ok) {

            throw new Error(
                "Failed to load category metadata."
            );

        }


        const metadata =
            await metadataResponse.json();


        const categories =
            Array.isArray(
                metadata.categories
            )
                ? metadata.categories
                : [];


        /*
            Find the Category ID in
            category-counter.json.
        */
        const registeredCategory =
            categories.find(
                category =>
                    category.category_id ===
                    categoryId
            );


        /*
            ========================================
            NEW CATEGORY
            ========================================

            Category ID does not exist in
            category-counter.json.

            Therefore this is a new category.
        */
        if (!registeredCategory) {

            categoryCheckPassed =
                true;


            setCategoryEditorLocked(
                false
            );


            showCategoryCheckStatus(
                "Category ID is not registered. This is a new category. You can edit the category.",
                "success"
            );


            return;
        }


        /*
            ========================================
            REGISTERED CATEGORY
            ========================================

            The Category ID already exists.

            Now compare the category names.
        */

        const registeredEn =
            (
                registeredCategory.category_en ||
                ""
            )
                .trim();


        const registeredJp =
            (
                registeredCategory.category_jp ||
                ""
            )
                .trim();


        /*
            English name must match.
        */
        if (
            registeredEn !==
            categoryEn
        ) {

            categoryCheckPassed =
                false;


            setCategoryEditorLocked(
                true
            );


            showCategoryCheckStatus(
                `Category ID "${categoryId}" is already registered as "${registeredEn}". The English category name does not match.`,
                "error"
            );


            return;
        }


        /*
            Japanese name:

            If the registered category has
            a Japanese name, it must match.
        */
        if (
            registeredJp &&
            registeredJp !== categoryJp
        ) {

            categoryCheckPassed =
                false;


            setCategoryEditorLocked(
                true
            );


            showCategoryCheckStatus(
                `Category ID "${categoryId}" is already registered with the Japanese name "${registeredJp}". The Japanese category name does not match.`,
                "error"
            );


            return;
        }


        /*
            ========================================
            CATEGORY VERIFIED
            ========================================

            ID exists and the category names
            match the registry.
        */

        categoryCheckPassed =
            true;


        setCategoryEditorLocked(
            false
        );


        showCategoryCheckStatus(
            "Category ID and category name are verified in the category registry. You can edit the category.",
            "success"
        );

    }
    catch (error) {

        console.error(
            "Category check failed:",
            error
        );


        categoryCheckPassed =
            false;


        setCategoryEditorLocked(
            true
        );


        showCategoryCheckStatus(
            "Unable to verify the category registry. Please try again.",
            "error"
        );

    }

}


/* ========================================
   Category Check Status
   ======================================== */

function showCategoryCheckStatus(
    message,
    type = "info"
) {

    const status =
        document.getElementById(
            "category-check-status"
        );


    if (!status) {
        return;
    }


    status.className =
        `category-check-status ${type}`;


    status.innerHTML = "";


    const messageElement =
        document.createElement(
            "span"
        );


    messageElement.className =
        "category-check-status-message";


    messageElement.textContent =
        message;


    const closeButton =
        document.createElement(
            "button"
        );


    closeButton.type =
        "button";


    closeButton.className =
        "category-check-status-close";


    closeButton.title =
        "Close";


    closeButton.setAttribute(
        "aria-label",
        "Close message"
    );


    closeButton.textContent =
        "×";


    closeButton.addEventListener(
        "click",
        () => {

            status.innerHTML = "";

            status.hidden = true;

        }
    );


    status.appendChild(
        messageElement
    );


    status.appendChild(
        closeButton
    );


    status.hidden =
        false;

}


function hideCategoryCheckStatus() {

    const status =
        document.getElementById(
            "category-check-status"
        );


    if (!status) {
        return;
    }


    status.hidden =
        true;

}


/* ========================================
   Create Empty Category
   ======================================== */

function createEmptyCategory() {

    return {

        category_id: "",

        category_en: "",

        category_jp: "",

        keywords_en: [],

        keywords_jp: [],

        description_en: "",

        description_jp: "",

        key_information: [],

        media: []

    };

}


/* ========================================
   Populate Form
   ======================================== */

function populateForm(
    data
) {

    document.getElementById(
        "category-id"
    ).value =
        data.category_id ||
        "";


    document.getElementById(
        "category-en"
    ).value =
        data.category_en ||
        "";


    document.getElementById(
        "category-jp"
    ).value =
        data.category_jp ||
        "";


    document.getElementById(
        "keywords-en"
    ).value =
        Array.isArray(
            data.keywords_en
        )
            ? data.keywords_en.join("\n")
            : "";


    document.getElementById(
        "keywords-jp"
    ).value =
        Array.isArray(
            data.keywords_jp
        )
            ? data.keywords_jp.join("\n")
            : "";


    document.getElementById(
        "description-en"
    ).value =
        data.description_en ||
        "";


    document.getElementById(
        "description-jp"
    ).value =
        data.description_jp ||
        "";


    renderKeyInformation(
        data.key_information ||
        []
    );


    renderMedia(
        data.media ||
        []
    );

}


/* ========================================
   Render Key Information
   ======================================== */

function renderKeyInformation(
    fields
) {

    const container =
        document.getElementById(
            "key-information-list"
        );


    container.innerHTML =
        "";


    if (!fields.length) {

        container.innerHTML = `
            <div class="empty-fields">
                No fields added yet.
            </div>
        `;

        return;
    }


    fields.forEach(
        field => {

            createKeyInformationRow(
                field
            );

        }
    );

}


/* ========================================
   Add Key Information
   ======================================== */

function addKeyInformationField() {

    const container =
        document.getElementById(
            "key-information-list"
        );


    const emptyState =
        container.querySelector(
            ".empty-fields"
        );


    if (emptyState) {
        emptyState.remove();
    }


    createKeyInformationRow({

        field_id:
            `field_${Date.now()}`,

        field_name:
            "",

        field_type:
            "text",

        value:
            ""

    });

}


/* ========================================
   Create Key Information Row
   ======================================== */

function createKeyInformationRow(
    field
) {

    const container =
        document.getElementById(
            "key-information-list"
        );


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "key-information-row";


    row.dataset.fieldId =
        field.field_id ||
        `field_${Date.now()}`;


    row.innerHTML = `

        <input
            type="text"
            class="key-field-name"
            placeholder="Field name"
            value="${escapeAttribute(
                field.field_name || ""
            )}"
        >

        <select class="key-field-type">

            <option
                value="text"
                ${
                    field.field_type === "text"
                        ? "selected"
                        : ""
                }
            >
                Text
            </option>

            <option
                value="textarea"
                ${
                    field.field_type === "textarea"
                        ? "selected"
                        : ""
                }
            >
                Textarea
            </option>

            <option
                value="time"
                ${
                    field.field_type === "time"
                        ? "selected"
                        : ""
                }
            >
                Time
            </option>

            <option
                value="number"
                ${
                    field.field_type === "number"
                        ? "selected"
                        : ""
                }
            >
                Number
            </option>

            <option
                value="boolean"
                ${
                    field.field_type === "boolean"
                        ? "selected"
                        : ""
                }
            >
                Boolean
            </option>

        </select>

        <input
            type="${getInputType(
                field.field_type
            )}"
            class="key-field-value"
            placeholder="Value"
            value="${escapeAttribute(
                field.value ?? ""
            )}"
        >

        <button
            type="button"
            class="remove-row-btn"
            title="Remove field"
        >
            ×
        </button>

    `;


    /*
        Remove field
    */
    row
        .querySelector(
            ".remove-row-btn"
        )
        .addEventListener(
            "click",
            () => {

                row.remove();


                if (
                    !container.children.length
                ) {

                    container.innerHTML = `
                        <div class="empty-fields">
                            No fields added yet.
                        </div>
                    `;

                }

            }
        );


    /*
        Change field type
    */
    row
        .querySelector(
            ".key-field-type"
        )
        .addEventListener(
            "change",
            event => {

                const input =
                    row.querySelector(
                        ".key-field-value"
                    );


                const currentValue =
                    input.value;


                const newType =
                    event.target.value;


                input.type =
                    getInputType(
                        newType
                    );


                input.value =
                    currentValue;

            }
        );


    container.appendChild(
        row
    );

}


/* ========================================
   Render Media
   ======================================== */

function renderMedia(
    media
) {

    const container =
        document.getElementById(
            "media-list"
        );


    container.innerHTML =
        "";


    if (!media.length) {

        container.innerHTML = `
            <div class="empty-media">
                No media added yet.
            </div>
        `;

        return;
    }


    media.forEach(
        item => {

            createMediaRow(
                item
            );

        }
    );

}


/* ========================================
   Add Media
   ======================================== */

function addMediaField() {

    const container =
        document.getElementById(
            "media-list"
        );


    const emptyState =
        container.querySelector(
            ".empty-media"
        );


    if (emptyState) {
        emptyState.remove();
    }


    createMediaRow({

        media_id:
            `media_${Date.now()}`,

        type:
            "image",

        file_name:
            "",

        url:
            ""

    });

}


/* ========================================
   Create Media Row
   ======================================== */

function createMediaRow(
    media
) {

    const container =
        document.getElementById(
            "media-list"
        );


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "media-row";


    row.dataset.mediaId =
        media.media_id ||
        `media_${Date.now()}`;


    row.innerHTML = `

        <select class="media-type">

            <option
                value="pdf"
                ${
                    media.type === "pdf"
                        ? "selected"
                        : ""
                }
            >
                PDF
            </option>

            <option
                value="image"
                ${
                    media.type === "image"
                        ? "selected"
                        : ""
                }
            >
                Image
            </option>

            <option
                value="video"
                ${
                    media.type === "video"
                        ? "selected"
                        : ""
                }
            >
                Video
            </option>

            <option
                value="document"
                ${
                    media.type === "document"
                        ? "selected"
                        : ""
                }
            >
                Docs
            </option>

            <option
                value="excel"
                ${
                    media.type === "excel"
                        ? "selected"
                        : ""
                }
            >
                Excel
            </option>

            <option
                value="note"
                ${
                    media.type === "note"
                        ? "selected"
                        : ""
                }
            >
                Note Article
            </option>

            <option
                value="other"
                ${
                    media.type === "other"
                        ? "selected"
                        : ""
                }
            >
                Others
            </option>

        </select>

        <input
            type="text"
            class="media-file-name"
            placeholder="File name"
            value="${escapeAttribute(
                media.file_name || ""
            )}"
        >

        <input
            type="text"
            class="media-url"
            placeholder="S3 URL"
            value="${escapeAttribute(
                media.url || ""
            )}"
        >

        <button
            type="button"
            class="remove-row-btn"
            title="Remove media"
        >
            ×
        </button>

    `;


    /*
        Remove media
    */
    row
        .querySelector(
            ".remove-row-btn"
        )
        .addEventListener(
            "click",
            () => {

                row.remove();


                if (
                    !container.children.length
                ) {

                    container.innerHTML = `
                        <div class="empty-media">
                            No media added yet.
                        </div>
                    `;

                }

            }
        );


    container.appendChild(
        row
    );

}


/* ========================================
   Collect Category Data
   ======================================== */

function collectCategoryData() {

    const keyInformation = [];


    document
        .querySelectorAll(
            ".key-information-row"
        )
        .forEach(
            (
                row,
                index
            ) => {

                const fieldName =
                    row
                        .querySelector(
                            ".key-field-name"
                        )
                        .value
                        .trim();


                const fieldType =
                    row
                        .querySelector(
                            ".key-field-type"
                        )
                        .value;


                let value =
                    row
                        .querySelector(
                            ".key-field-value"
                        )
                        .value;


                /*
                    Number
                */
                if (
                    fieldType === "number"
                ) {

                    value =
                        value === ""
                            ? null
                            : Number(value);

                }


                /*
                    Boolean
                */
                if (
                    fieldType === "boolean"
                ) {

                    value =
                        value === "true" ||
                        value === "yes";

                }


                keyInformation.push({

                    field_id:
                        row.dataset.fieldId ||
                        `field_${String(
                            index + 1
                        ).padStart(
                            3,
                            "0"
                        )}`,

                    field_name:
                        fieldName,

                    field_type:
                        fieldType,

                    value:
                        value

                });

            }
        );


    const media = [];


    document
        .querySelectorAll(
            ".media-row"
        )
        .forEach(
            (
                row,
                index
            ) => {

                media.push({

                    media_id:
                        row.dataset.mediaId ||
                        `media_${String(
                            index + 1
                        ).padStart(
                            3,
                            "0"
                        )}`,

                    type:
                        row
                            .querySelector(
                                ".media-type"
                            )
                            .value,

                    file_name:
                        row
                            .querySelector(
                                ".media-file-name"
                            )
                            .value
                            .trim(),

                    url:
                        row
                            .querySelector(
                                ".media-url"
                            )
                            .value
                            .trim()

                });

            }
        );


    return {

        category_id:
            document
                .getElementById(
                    "category-id"
                )
                .value
                .trim(),

        category_en:
            document
                .getElementById(
                    "category-en"
                )
                .value
                .trim(),

        category_jp:
            document
                .getElementById(
                    "category-jp"
                )
                .value
                .trim(),

        keywords_en:
            getLines(
                "keywords-en"
            ),

        keywords_jp:
            getLines(
                "keywords-jp"
            ),

        description_en:
            document
                .getElementById(
                    "description-en"
                )
                .value
                .trim(),

        description_jp:
            document
                .getElementById(
                    "description-jp"
                )
                .value
                .trim(),

        key_information:
            keyInformation,

        media:
            media

    };

}


/* ========================================
   Save Locally
   ======================================== */

function saveCategory() {

    /*
        Both existing and new categories
        must have a successful Check before
        saving.
    */
    if (!categoryCheckPassed) {

        showStatus(
            "Please check the Category ID before saving.",
            "error"
        );

        return;
    }


    const data =
        collectCategoryData();


    if (!data.category_id) {

        showStatus(
            "Category ID is required.",
            "error"
        );

        return;
    }


    if (!data.category_en) {

        showStatus(
            "Category Name (English) is required.",
            "error"
        );

        return;
    }


    const storageKey =
        `category_${data.category_id}`;


    localStorage.setItem(
        storageKey,
        JSON.stringify(
            data,
            null,
            2
        )
    );


    showStatus(
        "Category saved successfully.",
        "success"
    );

}


/* ========================================
   Normalize S3 Category
   ======================================== */

function normalizeS3Category(
    s3Data
) {

    const keyInformation =
        (
            s3Data.Key_Information ||
            []
        )
            .map(
                field => {

                    let value =
                        field.value;


                    /*
                        Number
                    */
                    if (
                        field.field_type ===
                        "number"
                    ) {

                        if (
                            value === "" ||
                            value === null ||
                            value === undefined
                        ) {

                            value = null;

                        }
                        else {

                            const numberValue =
                                Number(value);


                            value =
                                Number.isNaN(
                                    numberValue
                                )
                                    ? value
                                    : numberValue;

                        }

                    }


                    /*
                        Boolean
                    */
                    if (
                        field.field_type ===
                        "boolean"
                    ) {

                        if (
                            typeof value ===
                            "string"
                        ) {

                            const normalized =
                                value
                                    .trim()
                                    .toLowerCase();


                            value =
                                normalized ===
                                    "yes" ||
                                normalized ===
                                    "true";

                        }
                        else {

                            value =
                                Boolean(value);

                        }

                    }


                    return {

                        field_id:
                            field.field_id ||
                            "",

                        field_name:
                            field.field_name ||
                            "",

                        field_type:
                            field.field_type ||
                            "text",

                        value:
                            value

                    };

                }
            );


    return {

        category_id:
            s3Data.Category_ID ||
            "",

        category_en:
            s3Data.Category_EN ||
            "",

        category_jp:
            s3Data.Category_JP ||
            "",

        keywords_en:
            Array.isArray(
                s3Data.Keywords_EN
            )
                ? s3Data.Keywords_EN
                : [],

        keywords_jp:
            Array.isArray(
                s3Data.Keywords_JP
            )
                ? s3Data.Keywords_JP
                : [],

        description_en:
            s3Data.Description_EN ||
            "",

        description_jp:
            s3Data.Description_JP ||
            "",

        key_information:
            keyInformation,

        media:
            Array.isArray(
                s3Data.Media
            )
                ? s3Data.Media
                : []

    };

}


/* ========================================
   Fetch From S3
   ======================================== */

async function fetchFromS3(
    categoryId = null,
    automatic = false
) {

    /*
        If no ID was supplied, use the
        Category ID field.
    */
    if (!categoryId) {

        categoryId =
            document
                .getElementById(
                    "category-id"
                )
                .value
                .trim();

    }


    if (!categoryId) {

        showStatus(
            "Please enter a Category ID first.",
            "error"
        );

        return false;
    }


    console.log(
        "Fetching category from S3:",
        categoryId
    );


    try {

        showStatus(
            "Fetching category from S3...",
            "info"
        );


        const response =
            await fetch(
                `/api/knowledge/categories/${encodeURIComponent(
                    categoryId
                )}`
            );


        console.log(
            "S3 response status:",
            response.status
        );


        const data =
            await response
                .json()
                .catch(
                    () => ({})
                );


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Category was not found in S3."
            );

        }


        console.log(
            "S3 category data:",
            data
        );


        /*
            Normalize S3 data.
        */
        const normalizedData =
            normalizeS3Category(
                data
            );


        /*
            Make sure returned S3 category
            matches the requested ID.
        */
        if (
            normalizedData.category_id &&
            normalizedData.category_id !==
                categoryId
        ) {

            throw new Error(
                `S3 returned Category ID "${normalizedData.category_id}" instead of "${categoryId}".`
            );

        }


        /*
            Populate the editor.

            IMPORTANT:
            This does NOT mean the category
            has passed the registry Check.
        */
        populateForm(
            normalizedData
        );


        /*
            IMPORTANT:

            S3 fetch does NOT pass the
            Category Check.

            The user must click Check
            separately.
        */
        categoryCheckPassed =
            false;


        setCategoryEditorLocked(
            true
        );


        /*
            Save local copy.
        */
        localStorage.setItem(
            `category_${normalizedData.category_id}`,
            JSON.stringify(
                normalizedData,
                null,
                2
            )
        );


        showStatus(
            "Category content fetched from S3 successfully.",
            "success"
        );


        showCategoryCheckStatus(
            "Category content fetched from S3. Please click Check to verify the category registry.",
            "info"
        );


        return true;

    }
    catch (error) {

        console.error(
            "Failed to fetch category from S3:",
            error
        );


        /*
            S3 fetch failed.

            This does NOT mean that the
            category registry check failed.

            The editor remains locked because
            the S3 content was not loaded.
        */
        categoryCheckPassed =
            false;


        setCategoryEditorLocked(
            true
        );


        showStatus(
            error.message,
            "error"
        );


        showCategoryCheckStatus(
            "Unable to fetch category content from S3. The registry Check is still required.",
            "error"
        );


        return false;

    }

}


/* ========================================
   Send To S3
   ======================================== */

async function sendToS3() {

    /*
        Both existing and new categories
        must have a successful Check before
        sending to S3.
    */
    if (!categoryCheckPassed) {

        showStatus(
            "Please check the Category ID before sending to S3.",
            "error"
        );

        return;
    }


    const data =
        collectCategoryData();


    if (!data.category_id) {

        showStatus(
            "Category ID is required.",
            "error"
        );

        return;
    }


    if (!data.category_en) {

        showStatus(
            "Category Name (English) is required.",
            "error"
        );

        return;
    }


    try {

        showStatus(
            "Sending category to S3...",
            "info"
        );


        const s3Data = {

            Category_ID:
                data.category_id,

            Category_EN:
                data.category_en,

            Category_JP:
                data.category_jp,

            Keywords_EN:
                data.keywords_en,

            Keywords_JP:
                data.keywords_jp,

            Description_EN:
                data.description_en,

            Description_JP:
                data.description_jp,

            Key_Information:
                data.key_information,

            Media:
                data.media

        };


        const response =
            await fetch(
                `/api/knowledge/categories/${encodeURIComponent(
                    data.category_id
                )}`,
                {
                    method:
                        "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            s3Data
                        )
                }
            );


        const result =
            await response
                .json()
                .catch(
                    () => ({})
                );


        if (!response.ok) {

            throw new Error(
                result.error ||
                "Failed to send category to S3."
            );

        }


        localStorage.setItem(
            `category_${data.category_id}`,
            JSON.stringify(
                data,
                null,
                2
            )
        );


        showStatus(
            "Category sent to S3 successfully.",
            "success"
        );

    }
    catch (error) {

        console.error(
            "Failed to send category to S3:",
            error
        );


        showStatus(
            error.message,
            "error"
        );

    }

}


/* ========================================
   Preview
   ======================================== */

function previewCategory() {

    /*
        Both existing and new categories
        must have a successful Check before
        previewing.
    */
    if (!categoryCheckPassed) {

        showStatus(
            "Please check the Category ID before previewing.",
            "error"
        );

        return;
    }


    const data =
        collectCategoryData();


    const preview =
        document.getElementById(
            "category-preview"
        );


    if (!preview) {

        console.error(
            "Category preview container was not found."
        );

        return;
    }


    preview.innerHTML = `

        <div class="preview-category">

            <div class="preview-category-header">

                <span class="preview-category-label">
                    CATEGORY
                </span>

                <h2>
                    ${escapeHtml(
                        data.category_en ||
                        "Untitled Category"
                    )}
                </h2>

                <p class="preview-japanese-name">
                    ${escapeHtml(
                        data.category_jp ||
                        ""
                    )}
                </p>

            </div>

            ${
                data.description_en
                    ? `
                        <div class="preview-block">

                            <h3>
                                Description
                            </h3>

                            <p>
                                ${escapeHtml(
                                    data.description_en
                                )}
                            </p>

                        </div>
                    `
                    : ""
            }

            ${
                data.description_jp
                    ? `
                        <div class="preview-block">

                            <h3>
                                説明
                            </h3>

                            <p>
                                ${escapeHtml(
                                    data.description_jp
                                )}
                            </p>

                        </div>
                    `
                    : ""
            }

            ${
                data.keywords_en.length
                    ? `
                        <div class="preview-block">

                            <h3>
                                Keywords
                            </h3>

                            <div class="preview-tags">

                                ${data.keywords_en
                                    .map(
                                        keyword =>
                                            `
                                                <span>
                                                    ${escapeHtml(
                                                        keyword
                                                    )}
                                                </span>
                                            `
                                    )
                                    .join("")
                                }

                            </div>

                        </div>
                    `
                    : ""
            }

            ${
                data.keywords_jp.length
                    ? `
                        <div class="preview-block">

                            <h3>
                                キーワード
                            </h3>

                            <div class="preview-tags">

                                ${data.keywords_jp
                                    .map(
                                        keyword =>
                                            `
                                                <span>
                                                    ${escapeHtml(
                                                        keyword
                                                    )}
                                                </span>
                                            `
                                    )
                                    .join("")
                                }

                            </div>

                        </div>
                    `
                    : ""
            }

            ${
                data.key_information.length
                    ? `
                        <div class="preview-block">

                            <h3>
                                Key Information
                            </h3>

                            <div class="preview-information">

                                ${data.key_information
                                    .map(
                                        field =>
                                            `
                                                <div class="preview-information-row">

                                                    <span>
                                                        ${escapeHtml(
                                                            field.field_name
                                                        )}
                                                    </span>

                                                    <strong>
                                                        ${escapeHtml(
                                                            formatValue(
                                                                field.value
                                                            )
                                                        )}
                                                    </strong>

                                                </div>
                                            `
                                    )
                                    .join("")
                                }

                            </div>

                        </div>
                    `
                    : ""
            }

            ${
                data.media.length
                    ? `
                        <div class="preview-block">

                            <h3>
                                Media
                            </h3>

                            <div class="preview-media-list">

                                ${data.media
                                    .map(
                                        media =>
                                            `
                                                <div class="preview-media-item">

                                                    <span>
                                                        ${getMediaIcon(
                                                            media.type
                                                        )}
                                                    </span>

                                                    <div>

                                                        <strong>
                                                            ${escapeHtml(
                                                                media.file_name
                                                            )}
                                                        </strong>

                                                        <small>
                                                            ${escapeHtml(
                                                                getMediaTypeLabel(
                                                                    media.type
                                                                )
                                                            )}
                                                        </small>

                                                    </div>

                                                </div>
                                            `
                                    )
                                    .join("")
                                }

                            </div>

                        </div>
                    `
                    : ""
            }

        </div>

    `;


    showStatus(
        "Preview updated.",
        "success"
    );

}


/* ========================================
   Media Type Label
   ======================================== */

function getMediaTypeLabel(
    type
) {

    const labels = {

        pdf:
            "PDF",

        image:
            "Image",

        video:
            "Video",

        document:
            "Docs",

        excel:
            "Excel",

        note:
            "Note Article",

        other:
            "Others"

    };


    return (
        labels[type] ||
        "Others"
    );

}


/* ========================================
   Media Type Icon
   ======================================== */

function getMediaIcon(
    type
) {

    const icons = {

        pdf:
            "📄",

        image:
            "🖼️",

        video:
            "🎬",

        document:
            "📝",

        excel:
            "📊",

        note:
            "📒",

        other:
            "📎"

    };


    return (
        icons[type] ||
        "📎"
    );

}


/* ========================================
   Back
   ======================================== */

async function goBack() {

    try {

        const module =
            await import(
                "./manage.js"
            );


        await module.loadManagePage({

            parentCategory:
                currentParentCategory,

            subcategory:
                currentSubcategory

        });

    }
    catch (error) {

        console.error(
            "Failed to return to Manage page:",
            error
        );


        window.history.back();

    }

}


/* ========================================
   General Status
   ======================================== */

function showStatus(
    message,
    type = "info"
) {

    const status =
        document.getElementById(
            "category-content-status"
        );


    if (!status) {
        return;
    }


    status.className =
        `category-content-status ${type}`;


    status.innerHTML =
        "";


    const messageElement =
        document.createElement(
            "span"
        );


    messageElement.className =
        "category-content-status-message";


    messageElement.textContent =
        message;


    const closeButton =
        document.createElement(
            "button"
        );


    closeButton.type =
        "button";


    closeButton.className =
        "category-content-status-close";


    closeButton.title =
        "Close";


    closeButton.setAttribute(
        "aria-label",
        "Close message"
    );


    closeButton.textContent =
        "×";


    closeButton.addEventListener(
        "click",
        () => {
            status.innerHTML = "";
            status.hidden = true;

        }
    );


    status.appendChild(
        messageElement
    );


    status.appendChild(
        closeButton
    );


    status.hidden =
        false;

}


/* ========================================
   Get Lines
   ======================================== */

function getLines(
    elementId
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return [];
    }


    return element
        .value
        .split("\n")
        .map(
            line =>
                line.trim()
        )
        .filter(
            line =>
                line.length > 0
        );

}


/* ========================================
   Input Type Helper
   ======================================== */

function getInputType(
    type
) {

    /*
        "time" stays text because values
        can be time ranges such as:

            9:30 - 12:30
    */
    if (type === "time") {
        return "text";
    }


    if (type === "number") {
        return "number";
    }


    return "text";

}


/* ========================================
   Format Value
   ======================================== */

function formatValue(
    value
) {

    if (
        typeof value ===
        "boolean"
    ) {

        return value
            ? "Yes"
            : "No";
    }


    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value);

}


/* ========================================
   Escape HTML
   ======================================== */

function escapeHtml(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* ========================================
   Escape Attribute
   ======================================== */

function escapeAttribute(
    value
) {

    return escapeHtml(
        value
    );

}