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


    /* ========================================
       1. CHECK LOCAL DRAFT FIRST
       ======================================== */

    const localDraft =
        findLocalDraft(
            currentSubcategory?.id,
            currentSubcategory?.name
        );


    if (localDraft) {

        console.log(
            "Local category draft found:",
            localDraft
        );


        populateForm(
            localDraft
        );


        categoryCheckPassed =
            false;


        setCategoryEditorLocked(
            true
        );


        showCheckButton();


        showStatus(
            "Local draft loaded successfully.",
            "success"
        );


        showCategoryCheckStatus(
            "Your locally saved draft was loaded. Please click Check to verify the category before editing.",
            "info"
        );


        return;

    }


    /* ========================================
       2. EXISTING CATEGORY
       ======================================== */

    if (isExistingCategory) {

        console.log(
            "Existing category opened without automatic S3 fetch:",
            currentSubcategory
        );


        populateForm(
            createEmptyCategory()
        );


        document.getElementById(
            "category-id"
        ).value =
            currentSubcategory.id;


        document.getElementById(
            "category-en"
        ).value =
            currentSubcategory.name ||
            "";


        document.getElementById(
            "category-jp"
        ).value =
            currentSubcategory.nameJp ||
            "";


        categoryCheckPassed =
            false;


        setCategoryEditorLocked(
            true
        );


        showCheckButton();


        showStatus(
            "Existing category opened. Click Fetch from S3 to load the current S3 content.",
            "info"
        );


        showCategoryCheckStatus(
            "Click Fetch from S3 to load the current S3 content, or click Check to verify the category before editing.",
            "info"
        );


        return;

    }


    /* ========================================
       3. NEW CATEGORY
       ======================================== */

    console.log(
        "Opening new category without local draft:",
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


    document.getElementById(
        "category-jp"
    ).value =
        currentSubcategory?.nameJp ||
        "";


    categoryCheckPassed =
        false;


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
    const backButton =
        document.getElementById(
            "back-to-manage"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            goBack
        );

    }


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
    const saveButton =
        document.getElementById(
            "save-category-content-btn"
        );


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveCategory
        );

    }


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
        Import Excel
    */
    const importExcelButton =
        document.getElementById(
            "import-excel-btn"
        );


    if (importExcelButton) {

        importExcelButton.addEventListener(
            "click",
            importKeyInformationFromExcel
        );

    }


    /*
        Excel Example
    */
    setupExcelExampleModal();


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
            fetchFromS3
        );

    }


    /*
        Send to S3
    */
    const sendButton =
        document.getElementById(
            "send-to-s3-btn"
        );


    if (sendButton) {

        sendButton.addEventListener(
            "click",
            sendToS3
        );

    }

}


/* ========================================
   Excel Example Modal
   ======================================== */

function setupExcelExampleModal() {

    const excelExampleButton =
        document.getElementById(
            "excel-example-btn"
        );


    const excelExampleModal =
        document.getElementById(
            "excel-example-modal"
        );


    const excelExampleClose =
        document.getElementById(
            "excel-example-close"
        );


    const excelExampleOverlay =
        document.getElementById(
            "excel-example-overlay"
        );


    if (
        !excelExampleButton ||
        !excelExampleModal
    ) {

        return;

    }


    /*
        Open
    */
    excelExampleButton.addEventListener(
        "click",
        () => {

            excelExampleModal.hidden =
                false;

            document.body.style.overflow =
                "hidden";

        }
    );


    /*
        Close button
    */
    if (excelExampleClose) {

        excelExampleClose.addEventListener(
            "click",
            closeExcelExampleModal
        );

    }


    /*
        Click outside
    */
    if (excelExampleOverlay) {

        excelExampleOverlay.addEventListener(
            "click",
            closeExcelExampleModal
        );

    }


    /*
        ESC key
    */
    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                !excelExampleModal.hidden
            ) {

                closeExcelExampleModal();

            }

        }
    );

}


/* ========================================
   Close Excel Example Modal
   ======================================== */

function closeExcelExampleModal() {

    const excelExampleModal =
        document.getElementById(
            "excel-example-modal"
        );


    if (!excelExampleModal) {
        return;
    }


    excelExampleModal.hidden =
        true;


    document.body.style.overflow =
        "";

}


/* ========================================
   Import Excel - Main Function
   ======================================== */

async function importKeyInformationFromExcel() {

    try {

        await loadXLSXLibrary();

    }
    catch (error) {

        console.error(
            "Failed to load Excel library:",
            error
        );


        showStatus(
            "Unable to load the Excel reader. Please try again.",
            "error"
        );


        return;

    }


    const fileInput =
        document.createElement(
            "input"
        );


    fileInput.type =
        "file";


    fileInput.accept =
        ".xlsx,.xls";


    fileInput.style.display =
        "none";


    document.body.appendChild(
        fileInput
    );


    fileInput.addEventListener(
        "change",
        async event => {

            const file =
                event.target.files?.[0];


            if (!file) {

                fileInput.remove();

                return;

            }


            try {

                showStatus(
                    "Reading Excel file...",
                    "info"
                );


                const importedFields =
                    await parseKeyInformationExcel(
                        file
                    );


                if (
                    !importedFields.length
                ) {

                    throw new Error(
                        "Excel structure didn't match. No valid Key Information rows were found."
                    );

                }


                /*
                    Replace current fields only
                    after successful validation.
                */
                renderKeyInformation(
                    importedFields
                );


                showStatus(
                    `${importedFields.length} Key Information field${
                        importedFields.length === 1
                            ? ""
                            : "s"
                    } imported successfully from Excel.`,
                    "success"
                );


                showCategoryCheckStatus(
                    "Key Information was imported from Excel. Please review the fields before saving.",
                    "success"
                );


                console.log(
                    "Imported Key Information:",
                    importedFields
                );

            }
            catch (error) {

                console.error(
                    "Excel import failed:",
                    error
                );


                showStatus(
                    error.message ||
                    "Excel structure didn't match.",
                    "error"
                );

            }
            finally {

                fileInput.remove();

            }

        }
    );


    fileInput.click();

}


/* ========================================
   Load SheetJS Library
   ======================================== */

function loadXLSXLibrary() {

    if (
        typeof window.XLSX !==
        "undefined"
    ) {

        return Promise.resolve();

    }


    if (
        window.__xlsxLibraryPromise
    ) {

        return window.__xlsxLibraryPromise;

    }


    window.__xlsxLibraryPromise =
        new Promise(
            (
                resolve,
                reject
            ) => {

                const script =
                    document.createElement(
                        "script"
                    );


                script.src =
                    "https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js";


                script.async =
                    true;


                script.onload =
                    () => {

                        if (
                            typeof window.XLSX !==
                            "undefined"
                        ) {

                            resolve();

                        }
                        else {

                            reject(
                                new Error(
                                    "Excel library loaded but XLSX was not found."
                                )
                            );

                        }

                    };


                script.onerror =
                    () => {

                        reject(
                            new Error(
                                "Failed to load the Excel library."
                            )
                        );

                    };


                document.head.appendChild(
                    script
                );

            }
        );


    return window.__xlsxLibraryPromise;

}


/* ========================================
   Parse Key Information Excel
   ======================================== */

async function parseKeyInformationExcel(
    file
) {

    const fileName =
        file.name.toLowerCase();


    const isExcelFile =
        fileName.endsWith(".xlsx") ||
        fileName.endsWith(".xls");


    if (!isExcelFile) {

        throw new Error(
            "Excel structure didn't match. Please select an .xlsx or .xls file."
        );

    }


    const arrayBuffer =
        await file.arrayBuffer();


    let workbook;


    try {

        workbook =
            window.XLSX.read(
                arrayBuffer,
                {
                    type:
                        "array"
                }
            );

    }
    catch (error) {

        console.error(
            "Unable to read Excel file:",
            error
        );


        throw new Error(
            "Excel structure didn't match. The file could not be read."
        );

    }


    if (
        !workbook.SheetNames ||
        !workbook.SheetNames.length
    ) {

        throw new Error(
            "Excel structure didn't match. No worksheet was found."
        );

    }


    const firstSheetName =
        workbook.SheetNames[0];


    const worksheet =
        workbook.Sheets[
            firstSheetName
        ];


    if (!worksheet) {

        throw new Error(
            "Excel structure didn't match. The first worksheet could not be read."
        );

    }


    const rows =
        window.XLSX.utils.sheet_to_json(
            worksheet,
            {
                header:
                    1,

                defval:
                    "",

                raw:
                    false,

                blankrows:
                    false
            }
        );


    if (
        !rows ||
        !rows.length
    ) {

        throw new Error(
            "Excel structure didn't match. The worksheet is empty."
        );

    }


    /* ========================================
       Find Header Row
       ======================================== */

    /*
        The header does NOT have to be row 1.

        Example:

        ItemDetails
        Field Name | Type | Value

        will work.

        We also allow extra columns around
        the required columns.
    */

    const normalizedExpectedHeaders = [
        "field name",
        "type",
        "value"
    ];


    let headerRowIndex =
        -1;


    let headerColumnIndexes =
        null;


    for (
        let rowIndex = 0;
        rowIndex < rows.length;
        rowIndex++
    ) {

        const row =
            Array.isArray(
                rows[rowIndex]
            )
                ? rows[rowIndex]
                : [];


        const normalizedRow =
            row.map(
                value =>
                    String(
                        value ?? ""
                    )
                        .trim()
                        .toLowerCase()
            );


        const fieldNameIndex =
            normalizedRow.indexOf(
                normalizedExpectedHeaders[0]
            );


        const typeIndex =
            normalizedRow.indexOf(
                normalizedExpectedHeaders[1]
            );


        const valueIndex =
            normalizedRow.indexOf(
                normalizedExpectedHeaders[2]
            );


        if (
            fieldNameIndex !== -1 &&
            typeIndex !== -1 &&
            valueIndex !== -1
        ) {

            headerRowIndex =
                rowIndex;


            headerColumnIndexes = {

                fieldName:
                    fieldNameIndex,

                type:
                    typeIndex,

                value:
                    valueIndex

            };


            break;

        }

    }


    if (
        headerRowIndex === -1 ||
        !headerColumnIndexes
    ) {

        console.error(
            "Could not find required Excel headers."
        );


        console.error(
            "Excel rows:",
            rows
        );


        throw new Error(
            "Excel structure didn't match. The Excel file must contain these columns: Field Name, Type, Value."
        );

    }


    console.log(
        "Excel header row found:",
        headerRowIndex + 1
    );


    console.log(
        "Excel column positions:",
        headerColumnIndexes
    );


    /* ========================================
       Allowed Types
       ======================================== */

    const allowedTypes = {

        text:
            "text",

        textarea:
            "textarea",

        time:
            "time",

        number:
            "number",

        boolean:
            "boolean"

    };


    const importedFields = [];


    /* ========================================
       Process Rows
       ======================================== */

    for (
        let index =
            headerRowIndex + 1;

        index < rows.length;

        index++
    ) {

        const row =
            Array.isArray(
                rows[index]
            )
                ? rows[index]
                : [];


        const fieldName =
            String(
                row[
                    headerColumnIndexes.fieldName
                ] ?? ""
            ).trim();


        const typeText =
            String(
                row[
                    headerColumnIndexes.type
                ] ?? ""
            ).trim();


        const rawValue =
            row[
                headerColumnIndexes.value
            ] ?? "";


        /*
            Ignore completely empty rows.
        */
        if (
            !fieldName &&
            !typeText &&
            (
                rawValue === "" ||
                rawValue === null ||
                rawValue === undefined
            )
        ) {

            continue;

        }


        if (!fieldName) {

            throw new Error(
                `Excel structure didn't match. Field Name is missing in row ${index + 1}.`
            );

        }


        if (!typeText) {

            throw new Error(
                `Excel structure didn't match. Type is missing for "${fieldName}" in row ${index + 1}.`
            );

        }


        const normalizedType =
            typeText
                .toLowerCase()
                .trim();


        if (
            !allowedTypes[
                normalizedType
            ]
        ) {

            throw new Error(
                `Excel structure didn't match. Invalid Type "${typeText}" for "${fieldName}" in row ${index + 1}. Allowed types are: Text, Textarea, Time, Number, Boolean.`
            );

        }


        const fieldType =
            allowedTypes[
                normalizedType
            ];


        const convertedValue =
            convertExcelValue(
                rawValue,
                fieldType,
                index + 1
            );


        importedFields.push({

            field_id:
                `field_${Date.now()}_${index}`,

            field_name:
                fieldName,

            field_type:
                fieldType,

            value:
                convertedValue

        });

    }


    if (
        !importedFields.length
    ) {

        throw new Error(
            "Excel structure didn't match. No valid data rows were found."
        );

    }


    return importedFields;

}


/* ========================================
   Convert Excel Value
   ======================================== */

function convertExcelValue(
    rawValue,
    fieldType,
    rowNumber
) {

    /*
        The UI always uses a normal text
        input.

        Type is metadata only.

        We still normalize the value
        according to its declared type
        before saving.
    */


    /* ========================================
       TEXT
       ======================================== */

    if (
        fieldType ===
        "text"
    ) {

        if (
            rawValue === null ||
            rawValue === undefined
        ) {

            return "";

        }


        return String(
            rawValue
        ).trim();

    }


    /* ========================================
       TEXTAREA
       ======================================== */

    if (
        fieldType ===
        "textarea"
    ) {

        if (
            rawValue === null ||
            rawValue === undefined
        ) {

            return "";

        }


        return String(
            rawValue
        );

    }


    /* ========================================
       TIME
       ======================================== */

    if (
        fieldType ===
        "time"
    ) {

        if (
            rawValue === null ||
            rawValue === undefined ||
            rawValue === ""
        ) {

            return "";

        }


        if (
            typeof rawValue ===
            "number"
        ) {

            return excelNumberToTime(
                rawValue
            );

        }


        return String(
            rawValue
        ).trim();

    }


    /* ========================================
       NUMBER
       ======================================== */

    if (
        fieldType ===
        "number"
    ) {

        if (
            rawValue === null ||
            rawValue === undefined ||
            rawValue === ""
        ) {

            return null;

        }


        const numberValue =
            Number(
                rawValue
            );


        if (
            Number.isNaN(
                numberValue
            )
        ) {

            throw new Error(
                `"${rawValue}" is not a valid Number in row ${rowNumber}.`
            );

        }


        return numberValue;

    }


    /* ========================================
       BOOLEAN
       ======================================== */

    if (
        fieldType ===
        "boolean"
    ) {

        if (
            typeof rawValue ===
            "boolean"
        ) {

            return rawValue;

        }


        const normalized =
            String(
                rawValue
            )
                .trim()
                .toLowerCase();


        if (
            normalized === "true" ||
            normalized === "yes" ||
            normalized === "1"
        ) {

            return true;

        }


        if (
            normalized === "false" ||
            normalized === "no" ||
            normalized === "0"
        ) {

            return false;

        }


        throw new Error(
            `"${rawValue}" is not a valid Boolean in row ${rowNumber}. Use true or false.`
        );

    }


    return rawValue;

}


/* ========================================
   Convert Excel Decimal Time
   ======================================== */

function excelNumberToTime(
    value
) {

    const fraction =
        value -
        Math.floor(value);


    const totalMinutes =
        Math.round(
            fraction *
            24 *
            60
        );


    const hours =
        Math.floor(
            totalMinutes /
            60
        );


    const minutes =
        totalMinutes %
        60;


    return (
        String(hours)
            .padStart(
                2,
                "0"
            ) +
        ":" +
        String(minutes)
            .padStart(
                2,
                "0"
            )
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

                All other sections are locked
                until verification.
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


    if (!categoryId) {

        showCategoryCheckStatus(
            "Please enter a Category ID.",
            "error"
        );

        return;
    }


    if (!categoryEn) {

        showCategoryCheckStatus(
            "Please enter the Category Name (English).",
            "error"
        );

        return;
    }


    try {

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


        const registeredCategory =
            categories.find(
                category =>
                    category.category_id ===
                    categoryId
            );


        /*
            New category
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
            Registered category
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


    status.innerHTML =
        "";


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

            status.innerHTML =
                "";

            status.hidden =
                true;

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

        category_id:
            "",

        category_en:
            "",

        category_jp:
            "",

        keywords_en:
            [],

        keywords_jp:
            [],

        description_en:
            "",

        description_jp:
            "",

        key_information:
            [],

        media:
            []

    };

}


/* ========================================
   Find Local Draft
   ======================================== */

function findLocalDraft(
    categoryId,
    categoryName
) {

    /*
        1. Exact Category ID
    */
    if (categoryId) {

        const draft =
            loadLocalDraft(
                categoryId
            );


        if (draft) {

            return draft;

        }

    }


    /*
        2. Search by category name
    */
    if (!categoryName) {

        return null;

    }


    const targetName =
        categoryName
            .trim()
            .toLowerCase();


    for (
        let index = 0;
        index < localStorage.length;
        index++
    ) {

        const key =
            localStorage.key(index);


        if (
            !key ||
            !key.startsWith(
                "category_draft_"
            )
        ) {

            continue;

        }


        try {

            const savedDraft =
                localStorage.getItem(
                    key
                );


            if (!savedDraft) {

                continue;

            }


            const draft =
                JSON.parse(
                    savedDraft
                );


            if (
                !draft ||
                !draft.category_id ||
                !draft.category_en
            ) {

                continue;

            }


            const draftName =
                draft.category_en
                    .trim()
                    .toLowerCase();


            if (
                draftName ===
                targetName
            ) {

                return draft;

            }

        }
        catch (error) {

            console.warn(
                "Invalid local category draft:",
                key,
                error
            );

        }

    }


    return null;

}


/* ========================================
   Load Local Draft
   ======================================== */

function loadLocalDraft(
    categoryId
) {

    if (!categoryId) {
        return null;
    }


    const storageKey =
        `category_draft_${categoryId}`;


    const savedDraft =
        localStorage.getItem(
            storageKey
        );


    if (!savedDraft) {
        return null;
    }


    try {

        return JSON.parse(
            savedDraft
        );

    }
    catch (error) {

        console.error(
            "Failed to parse local category draft:",
            error
        );


        return null;

    }

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


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    if (
        !Array.isArray(fields) ||
        !fields.length
    ) {

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


    if (!container) {
        return;
    }


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


    if (!container) {
        return;
    }


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "key-information-row";


    row.dataset.fieldId =
        field.field_id ||
        `field_${Date.now()}`;


    /*
        Normalize field value.
    */
    let fieldValue =
        field.value;


    /*
        Prevent [object HTMLInputElement]
        or other DOM element values.
    */
    if (
        fieldValue instanceof HTMLInputElement ||
        fieldValue instanceof HTMLTextAreaElement ||
        fieldValue instanceof HTMLSelectElement
    ) {

        fieldValue =
            fieldValue.value;

    }


    if (
        fieldValue === null ||
        fieldValue === undefined
    ) {

        fieldValue =
            "";

    }


    /*
        Boolean values are displayed as
        normal text.
    */
    if (
        typeof fieldValue ===
        "boolean"
    ) {

        fieldValue =
            fieldValue
                ? "true"
                : "false";

    }


    /*
        Basic row HTML.
    */
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

        <span class="key-field-value-container"></span>

        <button
            type="button"
            class="remove-row-btn"
            title="Remove field"
        >
            ×
        </button>

    `;


    /*
        ALWAYS use one normal text input.
    */
    const valueContainer =
        row.querySelector(
            ".key-field-value-container"
        );


    const valueElement =
        createKeyInformationValueElement(
            fieldValue
        );


    valueContainer.appendChild(
        valueElement
    );


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
                    !container.querySelector(
                        ".key-information-row"
                    )
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
        Type is metadata only.
        The UI remains a normal text input.
    */
    row
        .querySelector(
            ".key-field-type"
        )
        .addEventListener(
            "change",
            () => {

                console.log(
                    "Key Information type changed:",
                    row
                        .querySelector(
                            ".key-field-type"
                        )
                        .value
                );

            }
        );


    container.appendChild(
        row
    );

}


/* ========================================
   Create Key Information Value Element
   ======================================== */

function createKeyInformationValueElement(
    value
) {

    /*
        Prevent DOM elements from becoming
        [object HTMLInputElement].
    */
    if (
        value instanceof HTMLInputElement ||
        value instanceof HTMLTextAreaElement ||
        value instanceof HTMLSelectElement
    ) {

        value =
            value.value;

    }


    if (
        value === null ||
        value === undefined
    ) {

        value =
            "";

    }


    value =
        String(value);


    const input =
        document.createElement(
            "input"
        );


    input.type =
        "text";


    input.className =
        "key-field-value";


    input.placeholder =
        "Value";


    input.value =
        value;


    return input;

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


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    if (
        !Array.isArray(media) ||
        !media.length
    ) {

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


    if (!container) {
        return;
    }


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


    if (!container) {
        return;
    }


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
                    !container.querySelector(
                        ".media-row"
                    )
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

                const nameElement =
                    row.querySelector(
                        ".key-field-name"
                    );


                const typeElement =
                    row.querySelector(
                        ".key-field-type"
                    );


                const valueElement =
                    row.querySelector(
                        ".key-field-value"
                    );


                const fieldName =
                    nameElement
                        ? nameElement.value.trim()
                        : "";


                const fieldType =
                    typeElement
                        ? typeElement.value
                        : "text";


                /*
                    ALWAYS read from normal
                    text input.
                */
                let value =
                    valueElement
                        ? valueElement.value
                        : "";


                /*
                    NUMBER
                */
                if (
                    fieldType === "number"
                ) {

                    value =
                        value === ""
                            ? null
                            : Number(value);


                    if (
                        value !== null &&
                        Number.isNaN(value)
                    ) {

                        value =
                            null;

                    }

                }


                /*
                    BOOLEAN
                */
                if (
                    fieldType === "boolean"
                ) {

                    const normalized =
                        String(value)
                            .trim()
                            .toLowerCase();


                    if (
                        normalized === "true" ||
                        normalized === "yes" ||
                        normalized === "1"
                    ) {

                        value =
                            true;

                    }
                    else if (
                        normalized === "false" ||
                        normalized === "no" ||
                        normalized === "0"
                    ) {

                        value =
                            false;

                    }

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


    /* ========================================
       MEDIA
       ======================================== */

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

                const typeElement =
                    row.querySelector(
                        ".media-type"
                    );


                const fileNameElement =
                    row.querySelector(
                        ".media-file-name"
                    );


                const urlElement =
                    row.querySelector(
                        ".media-url"
                    );


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
                        typeElement
                            ? typeElement.value
                            : "other",

                    file_name:
                        fileNameElement
                            ? fileNameElement.value.trim()
                            : "",

                    url:
                        urlElement
                            ? urlElement.value.trim()
                            : ""

                });

            }
        );


    /* ========================================
       RETURN CATEGORY
       ======================================== */

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


    const draftStorageKey =
        `category_draft_${data.category_id}`;


    localStorage.setItem(
        draftStorageKey,
        JSON.stringify(
            data,
            null,
            2
        )
    );


    console.log(
        "Category draft saved:",
        draftStorageKey
    );


    showStatus(
        "Category saved locally as a draft.",
        "success"
    );


    showCategoryCheckStatus(
        "Your changes were saved locally. They will remain available when you reopen this category until you send them to S3.",
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
        Array.isArray(
            s3Data.Key_Information
        )
            ? s3Data.Key_Information.map(
                field => {

                    let value =
                        field.value;


                    /*
                        Normalize Number
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

                            value =
                                null;

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
                        Normalize Boolean
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


                            if (
                                normalized ===
                                    "true" ||
                                normalized ===
                                    "yes" ||
                                normalized ===
                                    "1"
                            ) {

                                value =
                                    true;

                            }
                            else if (
                                normalized ===
                                    "false" ||
                                normalized ===
                                    "no" ||
                                normalized ===
                                    "0"
                            ) {

                                value =
                                    false;

                            }

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
            )
            : [];


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

async function fetchFromS3() {

    const categoryId =
        document
            .getElementById(
                "category-id"
            )
            .value
            .trim();


    if (!categoryId) {

        showStatus(
            "Please enter a Category ID first.",
            "error"
        );

        return false;

    }


    console.log(
        "Manually fetching category from S3:",
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


        const normalizedData =
            normalizeS3Category(
                data
            );


        if (
            normalizedData.category_id &&
            normalizedData.category_id !==
                categoryId
        ) {

            throw new Error(
                `S3 returned Category ID "${normalizedData.category_id}" instead of "${categoryId}".`
            );

        }


        populateForm(
            normalizedData
        );


        categoryCheckPassed =
            false;


        setCategoryEditorLocked(
            true
        );


        localStorage.setItem(
            `category_${normalizedData.category_id}`,
            JSON.stringify(
                normalizedData,
                null,
                2
            )
        );


        localStorage.removeItem(
            `category_draft_${categoryId}`
        );


        console.log(
            "Local draft removed after manual S3 fetch:",
            `category_draft_${categoryId}`
        );


        showStatus(
            "Category content fetched from S3 successfully.",
            "success"
        );


        showCategoryCheckStatus(
            "Category content fetched from S3. Please click Check to verify the category registry before editing.",
            "info"
        );


        return true;

    }
    catch (error) {

        console.error(
            "Failed to fetch category from S3:",
            error
        );


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


        localStorage.removeItem(
            `category_draft_${data.category_id}`
        );


        console.log(
            "Category draft removed after successful S3 upload:",
            `category_draft_${data.category_id}`
        );


        showStatus(
            "Category sent to S3 successfully.",
            "success"
        );


        showCategoryCheckStatus(
            "Category is now saved to S3. The local draft has been cleared.",
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

            status.innerHTML =
                "";

            status.hidden =
                true;

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


    return String(
        value
    );

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