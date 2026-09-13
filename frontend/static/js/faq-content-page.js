/* ========================================
   FAQ Content Page
   ======================================== */

let currentParentCategory = null;
let currentSubcategory = null;

let faqData = [];
let faqCounter = 0;

let categoryExistsInS3 = false;


/* ========================================
   Load FAQ Content Page
   ======================================== */

export async function loadFAQContentPage(
    parentCategory,
    categoryData
) {

    currentParentCategory =
        parentCategory || null;

    currentSubcategory =
        categoryData || null;


    const response =
        await fetch(
            "/static/components/faq-content-page.html"
        );


    if (!response.ok) {

        throw new Error(
            `Failed to load faq-content-page.html: ${response.status}`
        );
    }


    const html =
        await response.text();


    document.getElementById(
        "main-content"
    ).innerHTML = html;


    setupFAQContentPage();
}


/* ========================================
   Setup
   ======================================== */

function setupFAQContentPage() {

    setupButtons();

    setupCategoryInformation();

    setupFAQCount();

    createInitialFAQState();


    /*
        Check whether the category content
        itself exists in S3.

        New categories do not have category
        content yet, so the FAQ page will
        remain disabled.
    */

    if (
        currentSubcategory &&
        currentSubcategory.isNew === false &&
        getCategoryId()
    ) {

        checkCategoryContent();

    } else {

        /*
            New category or missing Category ID.
            Category content has not been created yet.
        */

        disableFAQPage();

        showFAQStatus(
            "The content for this topic is not created yet. Please create the category content first.",
            "error"
        );
    }
}


/* ========================================
   Setup Buttons
   ======================================== */

function setupButtons() {

    const backButton =
        document.getElementById(
            "faq-back-btn"
        );


    const saveButton =
        document.getElementById(
            "faq-save-btn"
        );


    const fetchButton =
        document.getElementById(
            "faq-fetch-btn"
        );


    const sendButton =
        document.getElementById(
            "faq-send-btn"
        );


    const generateButton =
        document.getElementById(
            "generate-faq-btn"
        );


    const addFAQButton =
        document.getElementById(
            "add-faq-btn"
        );


    const previewButton =
        document.getElementById(
            "faq-preview-btn"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            goBack
        );
    }


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveFAQ
        );
    }


    if (fetchButton) {

        fetchButton.addEventListener(
            "click",
            fetchFAQFromS3
        );
    }


    if (sendButton) {

        sendButton.addEventListener(
            "click",
            sendFAQToS3
        );
    }


    if (generateButton) {

        generateButton.addEventListener(
            "click",
            generateFAQs
        );
    }


    if (addFAQButton) {

        addFAQButton.addEventListener(
            "click",
            addFAQ
        );
    }


    if (previewButton) {

        previewButton.addEventListener(
            "click",
            updateJSONPreview
        );
    }
}


/* ========================================
   Setup FAQ Count
   ======================================== */

function setupFAQCount() {

    const countInput =
        document.getElementById(
            "faq-count-input"
        );


    if (!countInput) {
        return;
    }


    countInput.addEventListener(
        "input",
        updateGenerateButtonState
    );


    updateGenerateButtonState();
}


/* ========================================
   Update Generate Button State
   ======================================== */

function updateGenerateButtonState() {

    const countInput =
        document.getElementById(
            "faq-count-input"
        );


    const generateButton =
        document.getElementById(
            "generate-faq-btn"
        );


    if (
        !countInput ||
        !generateButton
    ) {
        return;
    }


    const value =
        countInput.value.trim();


    const count =
        Number(value);


    const isValid =
        value !== "" &&
        Number.isInteger(count) &&
        count >= 1 &&
        count <= 20;


    generateButton.disabled =
        !isValid;
}


/* ========================================
   Category Information
   ======================================== */

function setupCategoryInformation() {

    const categoryNameElement =
        document.querySelector(
            ".faq-category-name"
        );


    const categoryIdElement =
        document.querySelector(
            ".faq-category-id span"
        );


    if (
        currentSubcategory
    ) {

        if (categoryNameElement) {

            categoryNameElement.textContent =
                currentSubcategory.name ||
                currentSubcategory.category_en ||
                "";
        }


        if (categoryIdElement) {

            categoryIdElement.textContent =
                currentSubcategory.id ||
                currentSubcategory.category_id ||
                "";
        }
    }
}


/* ========================================
   Initial FAQ State
   ======================================== */

function createInitialFAQState() {

    faqData = [];

    faqCounter = 0;

    renderFAQList();
}


/* ========================================
   Check Category Content
   ======================================== */

async function checkCategoryContent() {

    const categoryId =
        getCategoryId();


    if (!categoryId) {

        categoryExistsInS3 =
            false;

        disableFAQPage();

        showFAQStatus(
            "The content for this topic is not created yet. Please create the category content first.",
            "error"
        );

        return;
    }


    try {

        showFAQStatus(
            "Checking category content...",
            "info"
        );


        const categoryExists =
            await checkCategoryExistsInS3(
                categoryId
            );


        /*
            Category itself does not exist.
            FAQ page must remain disabled.
        */

        if (!categoryExists) {

            disableFAQPage();

            showFAQStatus(
                "The content for this topic is not created yet. Please create the category content first.",
                "error"
            );

            return;
        }


        /*
            Category exists.

            Now try to fetch FAQ data.

            If FAQ does not exist, fetchFAQFromS3()
            will simply leave an empty FAQ list.
        */

        await fetchFAQFromS3();


    } catch (error) {

        console.error(
            "Category content check failed:",
            error
        );


        categoryExistsInS3 =
            false;


        disableFAQPage();

        showFAQStatus(
            "The content for this topic is not created yet. Please create the category content first.",
            "error"
        );
    }
}


/* ========================================
   Disable FAQ Page
   ======================================== */

function disableFAQPage() {

    const page =
        document.querySelector(
            ".faq-content-page"
        );


    if (!page) {
        return;
    }


    const controls =
        page.querySelectorAll(
            "button, input, textarea, select"
        );


    controls.forEach(
        control => {

            if (
                control.id ===
                "faq-back-btn"
            ) {
                return;
            }


            control.disabled =
                true;
        }
    );


    const sections =
        page.querySelectorAll(
            ".faq-generate-section, " +
            ".faq-editor-section, " +
            ".faq-preview-section"
        );


    sections.forEach(
        section => {

            section.style.opacity =
                "0.55";

            section.style.pointerEvents =
                "none";
        }
    );


    const backButton =
        document.getElementById(
            "faq-back-btn"
        );


    if (backButton) {

        backButton.disabled =
            false;

        backButton.style.opacity =
            "";

        backButton.style.pointerEvents =
            "";
    }
}


/* ========================================
   Generate FAQs
   ======================================== */

async function generateFAQs() {

    const categoryId =
        getCategoryId();


    if (!categoryId) {

        showFAQStatus(
            "Category ID is missing.",
            "error"
        );

        return;
    }


    if (!categoryExistsInS3) {

        showFAQStatus(
            "The content for this topic is not created yet. Please create the category content first.",
            "error"
        );

        return;
    }


    const countInput =
        document.getElementById(
            "faq-count-input"
        );


    const countValue =
        countInput?.value?.trim() ||
        "";


    const faqCount =
        Number(countValue);


    if (
        countValue === "" ||
        !Number.isInteger(faqCount) ||
        faqCount < 1 ||
        faqCount > 20
    ) {

        showFAQStatus(
            "Please enter a valid number of FAQs between 1 and 20.",
            "error"
        );

        updateGenerateButtonState();

        return;
    }


    setGenerateLoadingState(
        true
    );


    try {

        showFAQStatus(
            "Generating FAQs with Claude...",
            "info"
        );


        const generatedFAQs =
            await generateFAQsWithClaude(
                categoryId,
                faqCount
            );


        if (
            !generatedFAQs ||
            !Array.isArray(
                generatedFAQs
            )
        ) {

            throw new Error(
                "Invalid FAQ data returned from Claude."
            );
        }


        faqData =
            generatedFAQs;


        normalizeFAQIds();

        renderFAQList();


        showFAQStatus(
            "FAQs generated successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "FAQ generation failed:",
            error
        );


        showFAQStatus(
            error.message ||
            "Failed to generate FAQs.",
            "error"
        );


    } finally {

        setGenerateLoadingState(
            false
        );

        updateGenerateButtonState();
    }
}


/* ========================================
   Check Category Exists in S3
   ======================================== */

async function checkCategoryExistsInS3(
    categoryId
) {

    try {

        const response =
            await fetch(
                `/api/knowledge/categories/${encodeURIComponent(
                    categoryId
                )}`
            );


        if (!response.ok) {

            categoryExistsInS3 =
                false;

            return false;
        }


        const data =
            await response.json();


        if (
            !data ||
            typeof data !== "object"
        ) {

            categoryExistsInS3 =
                false;

            return false;
        }


        categoryExistsInS3 =
            true;

        return true;


    } catch (error) {

        console.error(
            "Category existence check failed:",
            error
        );


        categoryExistsInS3 =
            false;

        return false;
    }
}


/* ========================================
   Generate FAQs With Claude
   ======================================== */

async function generateFAQsWithClaude(
    categoryId,
    faqCount
) {

    const response =
        await fetch(
            "/api/knowledge/generate-faqs",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    category_id:
                        categoryId,

                    count:
                        faqCount

                })
            }
        );


    if (!response.ok) {

        let errorMessage =
            "Failed to generate FAQs.";


        try {

            const errorData =
                await response.json();


            if (
                errorData.error
            ) {

                errorMessage =
                    errorData.error;

            } else if (
                errorData.message
            ) {

                errorMessage =
                    errorData.message;
            }

        } catch (error) {

            /*
                Ignore JSON parsing errors.
            */
        }


        throw new Error(
            errorMessage
        );
    }


    const data =
        await response.json();


    return data.faqs || [];
}


/* ========================================
   Add FAQ
   ======================================== */

function addFAQ() {

    const nextNumber =
        faqData.length + 1;


    faqData.push({

        id:
            `faq_${String(
                nextNumber
            ).padStart(3, "0")}`,

        question_en:
            "",

        question_jp:
            "",

        answer_en:
            "",

        answer_jp:
            "",

        follow_ups:
            []

    });


    renderFAQList();


    showFAQStatus(
        "New FAQ added.",
        "success"
    );
}


/* ========================================
   Render FAQ List
   ======================================== */

function renderFAQList() {

    const faqList =
        document.getElementById(
            "faq-list"
        );


    if (!faqList) {
        return;
    }


    faqList.innerHTML = "";


    if (
        faqData.length === 0
    ) {

        faqList.innerHTML = `

            <div class="faq-empty-state">

                <p>
                    No FAQs available yet.
                </p>

                <p>
                    Generate FAQs with Claude
                    or add an FAQ manually.
                </p>

            </div>

        `;

        return;
    }


    faqData.forEach(
        (
            faq,
            index
        ) => {

            const faqCard =
                createFAQCard(
                    faq,
                    index
                );


            faqList.appendChild(
                faqCard
            );
        }
    );
}


/* ========================================
   Check Required FAQ Fields
   ======================================== */

function isFAQComplete(
    faq
) {

    return Boolean(

        faq.question_en?.trim() &&

        faq.question_jp?.trim() &&

        faq.answer_en?.trim() &&

        faq.answer_jp?.trim()

    );
}


/* ========================================
   Create FAQ Card
   ======================================== */

function createFAQCard(
    faq,
    index
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "faq-card";


    const followUpHTML =
        createFollowUpOptions(
            faq.id
        );


    const completionStatus =
        isFAQComplete(faq)
            ? `
                <span
                    class="faq-completed-status"
                    title="FAQ completed"
                >

                    <span class="faq-completed-check">
                        ✓
                    </span>

                    <span class="faq-status-text">
                        Complete
                    </span>

                </span>
            `
            : `
                <span
                    class="faq-incomplete-status"
                    title="FAQ incomplete"
                >

                    <span class="faq-incomplete-check">
                        ✕
                    </span>

                    <span class="faq-status-text">
                        Incomplete
                    </span>

                </span>
            `;


    card.innerHTML = `

        <div class="faq-card-header">

            <div class="faq-card-title">

                <span class="faq-number">
                    FAQ ${String(
                        index + 1
                    ).padStart(3, "0")}
                </span>

                <span class="faq-card-id">
                    ${escapeHtml(
                        faq.id
                    )}
                </span>

                ${completionStatus}

            </div>


            <button
                class="faq-delete-btn"
                type="button"
                data-index="${index}"
            >
                Delete
            </button>

        </div>


        <div class="faq-field">

            <label>
                Question (English)
                <span class="faq-required">*</span>
            </label>

            <input
                type="text"
                class="faq-question-en"
                value="${escapeAttribute(
                    faq.question_en
                )}"
                placeholder="Enter the question in English"
                data-index="${index}"
                data-field="question_en"
            >

        </div>


        <div class="faq-field">

            <label>
                Question (Japanese)
                <span class="faq-required">*</span>
            </label>

            <input
                type="text"
                class="faq-question-jp"
                value="${escapeAttribute(
                    faq.question_jp
                )}"
                placeholder="Enter the question in Japanese"
                data-index="${index}"
                data-field="question_jp"
            >

        </div>


        <div class="faq-field">

            <label>
                Answer (English)
                <span class="faq-required">*</span>
            </label>

            <textarea
                class="faq-answer-en"
                rows="4"
                placeholder="Enter the answer in English"
                data-index="${index}"
                data-field="answer_en"
            >${escapeHtml(
                faq.answer_en
            )}</textarea>

        </div>


        <div class="faq-field">

            <label>
                Answer (Japanese)
                <span class="faq-required">*</span>
            </label>

            <textarea
                class="faq-answer-jp"
                rows="4"
                placeholder="Enter the answer in Japanese"
                data-index="${index}"
                data-field="answer_jp"
            >${escapeHtml(
                faq.answer_jp
            )}</textarea>

        </div>


        <div class="faq-field">

            <label>
                Follow-up Questions
            </label>

            <div class="faq-followup-container">

                ${followUpHTML}

            </div>

        </div>
    `;


    /* ========================================
       FAQ Card Selection
       ======================================== */

    card.addEventListener(
        "click",
        () => {

            document
                .querySelectorAll(
                    ".faq-card"
                )
                .forEach(
                    faqCard => {

                        faqCard.classList.remove(
                            "selected"
                        );
                    }
                );


            card.classList.add(
                "selected"
            );
        }
    );


    setupFAQCardEvents(
        card
    );


    return card;
}


/* ========================================
   Follow-up Options
   ======================================== */

function createFollowUpOptions(
    currentFAQId
) {

    if (
        faqData.length <= 1
    ) {

        return `
            <div class="faq-no-followups">
                No other FAQs available.
            </div>
        `;
    }


    return faqData
        .filter(
            faq =>
                faq.id !==
                currentFAQId
        )
        .map(
            faq => {

                const isChecked =
                    faqData
                        .find(
                            item =>
                                item.id ===
                                currentFAQId
                        )
                        ?.follow_ups
                        ?.includes(
                            faq.id
                        );


                return `

                    <label
                        class="faq-followup-option"
                    >

                        <input
                            type="checkbox"
                            value="${escapeAttribute(
                                faq.id
                            )}"
                            data-current-id="${escapeAttribute(
                                currentFAQId
                            )}"
                            ${isChecked ? "checked" : ""}
                        >

                        <span>
                            ${escapeHtml(
                                faq.question_en ||
                                faq.id
                            )}
                        </span>

                    </label>

                `;
            }
        )
        .join("");
}


/* ========================================
   FAQ Card Events
   ======================================== */

function setupFAQCardEvents(
    card
) {

    const inputs =
        card.querySelectorAll(
            "[data-field]"
        );


    inputs.forEach(
        input => {

            input.addEventListener(
                "input",
                () => {

                    const index =
                        Number(
                            input.dataset.index
                        );


                    const field =
                        input.dataset.field;


                    faqData[index][field] =
                        input.value;


                    updateFAQCompletionStatus(
                        card,
                        faqData[index]
                    );
                }
            );
        }
    );


    const deleteButton =
        card.querySelector(
            ".faq-delete-btn"
        );


    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            (event) => {

                /*
                    Prevent the delete button click
                    from also selecting the FAQ card.
                */

                event.stopPropagation();


                const index =
                    Number(
                        deleteButton.dataset.index
                    );


                deleteFAQ(
                    index
                );
            }
        );
    }


    const followUpCheckboxes =
        card.querySelectorAll(
            'input[type="checkbox"][data-current-id]'
        );


    followUpCheckboxes.forEach(
        checkbox => {

            checkbox.addEventListener(
                "change",
                (event) => {

                    /*
                        Prevent checkbox interaction
                        from changing card selection.
                    */

                    event.stopPropagation();


                    const currentId =
                        checkbox.dataset.currentId;


                    const faq =
                        faqData.find(
                            item =>
                                item.id ===
                                currentId
                        );


                    if (!faq) {
                        return;
                    }


                    if (
                        checkbox.checked
                    ) {

                        if (
                            !faq.follow_ups.includes(
                                checkbox.value
                            )
                        ) {

                            faq.follow_ups.push(
                                checkbox.value
                            );
                        }

                    } else {

                        faq.follow_ups =
                            faq.follow_ups.filter(
                                id =>
                                    id !==
                                    checkbox.value
                            );
                    }

                }
            );
        }
    );


    /*
        Prevent inputs and textareas from
        selecting the FAQ card while editing.
    */

    const editableFields =
        card.querySelectorAll(
            "input:not([type='checkbox']), textarea"
        );


    editableFields.forEach(
        field => {

            field.addEventListener(
                "click",
                event => {
                    event.stopPropagation();
                }
            );
        }
    );
}


/* ========================================
   Update FAQ Completion Status
   ======================================== */

function updateFAQCompletionStatus(
    card,
    faq
) {

    const title =
        card.querySelector(
            ".faq-card-title"
        );


    if (!title) {
        return;
    }


    const existingStatus =
        title.querySelector(
            ".faq-completed-status, .faq-incomplete-status"
        );


    if (existingStatus) {

        existingStatus.remove();
    }


    const complete =
        isFAQComplete(
            faq
        );


    const status =
        document.createElement(
            "span"
        );


    if (complete) {

        status.className =
            "faq-completed-status";

        status.title =
            "FAQ completed";

        status.innerHTML = `

            <span class="faq-completed-check">
                ✓
            </span>

            <span class="faq-status-text">
                Complete
            </span>

        `;

    } else {

        status.className =
            "faq-incomplete-status";

        status.title =
            "FAQ incomplete";

        status.innerHTML = `

            <span class="faq-incomplete-check">
                ✕
            </span>

            <span class="faq-status-text">
                Incomplete
            </span>

        `;
    }


    title.appendChild(
        status
    );
}


/* ========================================
   Delete FAQ
   ======================================== */

function deleteFAQ(
    index
) {

    if (
        !faqData[index]
    ) {
        return;
    }


    const deletedFAQ =
        faqData[index];


    faqData.splice(
        index,
        1
    );


    normalizeFAQIds();

    renderFAQList();


    showFAQStatus(
        `${deletedFAQ.id} deleted.`,
        "success"
    );
}


/* ========================================
   Normalize FAQ IDs
   ======================================== */

function normalizeFAQIds() {

    const oldToNewIds = {};


    faqData.forEach(
        (
            faq,
            index
        ) => {

            const oldId =
                faq.id;


            const newId =
                `faq_${String(
                    index + 1
                ).padStart(3, "0")}`;


            oldToNewIds[oldId] =
                newId;
        }
    );


    faqData.forEach(
        faq => {

            faq.id =
                oldToNewIds[
                    faq.id
                ];


            faq.follow_ups =
                (
                    faq.follow_ups ||
                    []
                )
                .map(
                    oldId =>
                        oldToNewIds[
                            oldId
                        ]
                )
                .filter(
                    Boolean
                );
        }
    );
}


/* ========================================
   Fetch FAQ From S3
   ======================================== */

async function fetchFAQFromS3() {

    const categoryId =
        getCategoryId();


    if (!categoryId) {

        showFAQStatus(
            "Category ID is missing.",
            "error"
        );

        return;
    }


    setFetchLoadingState(
        true
    );


    try {

        showFAQStatus(
            "Fetching FAQ data from S3...",
            "info"
        );


        const response =
            await fetch(
                `/api/knowledge/categories/${encodeURIComponent(
                    categoryId
                )}/faq`
            );


        /*
            FAQ file does not exist.

            This is NOT an error.

            The category itself already exists,
            so the user can create new FAQs.
        */

        if (!response.ok) {

            faqData = [];

            renderFAQList();


            showFAQStatus(
                "No FAQ data has been created yet. You can create FAQs below.",
                "info"
            );


            return;
        }


        const data =
            await response.json();


        if (
            !data ||
            !Array.isArray(
                data.faqs
            )
        ) {

            throw new Error(
                "Invalid FAQ data received from S3."
            );
        }


        faqData =
            data.faqs;


        normalizeFAQIds();

        renderFAQList();


        showFAQStatus(
            "FAQ data fetched successfully from S3.",
            "success"
        );


    } catch (error) {

        console.error(
            "FAQ fetch failed:",
            error
        );


        showFAQStatus(
            error.message ||
            "Failed to fetch FAQ data.",
            "error"
        );


    } finally {

        setFetchLoadingState(
            false
        );
    }
}


/* ========================================
   Validate Required Fields
   ======================================== */

function validateFAQData() {

    for (
        let index = 0;
        index < faqData.length;
        index++
    ) {

        const faq =
            faqData[index];


        if (!isFAQComplete(faq)) {

            showFAQStatus(
                `FAQ ${String(
                    index + 1
                ).padStart(3, "0")} is incomplete. Please fill in Question (English), Question (Japanese), Answer (English), and Answer (Japanese).`,
                "error"
            );


            const faqCards =
                document.querySelectorAll(
                    ".faq-card"
                );


            if (faqCards[index]) {

                faqCards[index].scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }


            return false;
        }
    }


    return true;
}


/* ========================================
   Save FAQ
   ======================================== */

function saveFAQ() {

    if (!validateFAQData()) {
        return;
    }


    const data =
        collectFAQData();


    localStorage.setItem(
        "faqContentData",
        JSON.stringify(
            data
        )
    );


    showFAQStatus(
        "FAQ data saved locally.",
        "success"
    );
}


/* ========================================
   Send FAQ To S3
   ======================================== */

async function sendFAQToS3() {

    const categoryId =
        getCategoryId();


    if (!categoryId) {

        showFAQStatus(
            "Category ID is missing.",
            "error"
        );

        return;
    }


    if (!categoryExistsInS3) {

        showFAQStatus(
            "The content for this topic is not created yet. Please create the category content first.",
            "error"
        );

        return;
    }


    if (!validateFAQData()) {
        return;
    }


    const data =
        collectFAQData();


    try {

        setSendLoadingState(
            true
        );


        showFAQStatus(
            "Sending FAQ data to S3...",
            "info"
        );


        const response =
            await fetch(
                `/api/knowledge/categories/${encodeURIComponent(
                    categoryId
                )}/faq`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            data
                        )
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to send FAQ data to S3."
            );
        }


        showFAQStatus(
            "FAQ data sent to S3 successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "FAQ S3 upload failed:",
            error
        );


        showFAQStatus(
            error.message ||
            "Failed to send FAQ data to S3.",
            "error"
        );


    } finally {

        setSendLoadingState(
            false
        );
    }
}


/* ========================================
   Collect FAQ Data
   ======================================== */

function collectFAQData() {

    return {

        category_id:
            getCategoryId(),

        category_en:
            getCategoryName(),

        faqs:
            faqData.map(
                faq => ({

                    id:
                        faq.id,

                    question_en:
                        faq.question_en,

                    question_jp:
                        faq.question_jp,

                    answer_en:
                        faq.answer_en,

                    answer_jp:
                        faq.answer_jp,

                    follow_ups:
                        faq.follow_ups ||
                        []

                })
            )

    };
}


/* ========================================
   JSON Preview
   ======================================== */

function updateJSONPreview() {

    const preview =
        document.getElementById(
            "faq-json-preview"
        );


    if (!preview) {
        return;
    }


    const data =
        collectFAQData();


    preview.textContent =
        JSON.stringify(
            data,
            null,
            2
        );


    showFAQStatus(
        "JSON preview updated.",
        "success"
    );
}


/* ========================================
   Category ID
   ======================================== */

function getCategoryId() {

    if (
        currentSubcategory?.id
    ) {

        return currentSubcategory.id;
    }


    if (
        currentSubcategory?.category_id
    ) {

        return currentSubcategory.category_id;
    }


    const element =
        document.querySelector(
            ".faq-category-id span"
        );


    return (
        element?.textContent?.trim() ||
        ""
    );
}


/* ========================================
   Category Name
   ======================================== */

function getCategoryName() {

    if (
        currentSubcategory?.name
    ) {

        return currentSubcategory.name;
    }


    if (
        currentSubcategory?.category_en
    ) {

        return currentSubcategory.category_en;
    }


    const element =
        document.querySelector(
            ".faq-category-name"
        );


    return (
        element?.textContent?.trim() ||
        ""
    );
}


/* ========================================
   Generate Loading State
   ======================================== */

function setGenerateLoadingState(
    isLoading
) {

    const button =
        document.getElementById(
            "generate-faq-btn"
        );


    const loader =
        document.getElementById(
            "faq-generation-loader"
        );


    if (button) {

        button.disabled =
            isLoading;
    }


    if (loader) {

        loader.classList.toggle(
            "hidden",
            !isLoading
        );
    }
}


/* ========================================
   Fetch Loading State
   ======================================== */

function setFetchLoadingState(
    isLoading
) {

    const button =
        document.getElementById(
            "faq-fetch-btn"
        );


    if (button) {

        button.disabled =
            isLoading;

        button.textContent =
            isLoading
                ? "Fetching..."
                : "Fetch from S3";
    }
}


/* ========================================
   Send Loading State
   ======================================== */

function setSendLoadingState(
    isLoading
) {

    const button =
        document.getElementById(
            "faq-send-btn"
        );


    if (button) {

        button.disabled =
            isLoading;

        button.textContent =
            isLoading
                ? "Sending..."
                : "Send to S3";
    }
}


/* ========================================
   Status Message
   ======================================== */

function showFAQStatus(
    message,
    type
) {

    const element =
        document.getElementById(
            "faq-status-message"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.classList.remove(
        "hidden"
    );


    /*
        Status colors are defined here
        in one place.
    */

    const statusColors = {

        success: {
            background: "#eaf7ee",
            color: "#267a3d"
        },

        error: {
            background: "#fdecec",
            color: "#b42318"
        },

        info: {
            background: "#eef6ff",
            color: "#1d5fa7"
        },

        neutral: {
            background: "#f1f1f1",
            color: "#555"
        }

    };


    const selectedColor =
        statusColors[type] ||
        statusColors.neutral;


    element.style.background =
        selectedColor.background;

    element.style.color =
        selectedColor.color;
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


    } catch (error) {

        console.error(
            "Failed to return to Manage page:",
            error
        );


        alert(
            "Unable to return to the Manage page."
        );
    }
}


/* ========================================
   HTML Escape
   ======================================== */

function escapeHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(
        value
    )
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
   Attribute Escape
   ======================================== */

function escapeAttribute(
    value
) {

    return escapeHtml(
        value
    );
}