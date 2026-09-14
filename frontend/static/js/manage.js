/* ========================================
   Load Manage Page
   ======================================== */

export async function loadManagePage(data) {

    const response =
        await fetch(
            "/static/components/manage.html"
        );


    if (!response.ok) {

        throw new Error(
            `Failed to load manage.html: ${response.status}`
        );

    }


    const html =
        await response.text();


    document.getElementById(
        "main-content"
    ).innerHTML = html;


    /*
        data:

        {
            parentCategory: {
                id: "school_001",
                name: "School"
            },

            subcategory: {
                name: "After School"
            }
        }

        The subcategory does NOT need to contain
        the Category ID.

        The Category ID will be found from
        category-counter or local drafts when
        the user clicks the "Category" or "FAQ"
        button.
    */

    const parentCategory =
        data.parentCategory;


    const subcategory =
        data.subcategory;


    document.getElementById(
        "manage-title"
    ).textContent =
        subcategory.name;


    document.getElementById(
        "manage-description"
    ).textContent =
        `Manage ${subcategory.name} information.`;


    setupManagePage(
        parentCategory,
        subcategory
    );

}


/* ========================================
   Setup
   ======================================== */

function setupManagePage(
    parentCategory,
    subcategory
) {

    /* ----------------------------------------
       Back
       ---------------------------------------- */

    document
        .getElementById(
            "back-to-category"
        )
        .addEventListener(
            "click",
            () =>
                goBack(
                    parentCategory
                )
        );


    /* ----------------------------------------
       Category
       ---------------------------------------- */

    document
        .getElementById(
            "manage-category-btn"
        )
        .addEventListener(
            "click",
            () =>
                openCategoryEditor(
                    parentCategory,
                    subcategory
                )
        );


    /* ----------------------------------------
       FAQ
       ---------------------------------------- */

    document
        .getElementById(
            "manage-faq-btn"
        )
        .addEventListener(
            "click",
            () =>
                openFaqEditor(
                    parentCategory,
                    subcategory
                )
        );

}


/* ========================================
   Category
   ======================================== */

async function openCategoryEditor(
    parentCategory,
    subcategory
) {

    try {

        /*
            ========================================
            1. Get category-counter
            ========================================
        */

        const response =
            await fetch(
                "/api/metadata/category-counter"
            );


        if (!response.ok) {

            throw new Error(
                `Failed to fetch category counter: ${response.status}`
            );

        }


        const metadata =
            await response.json();


        /*
            ========================================
            2. Get categories array
            ========================================
        */

        const categories =
            Array.isArray(
                metadata.categories
            )
                ? metadata.categories
                : [];


        /*
            ========================================
            3. Find registered category by name
            ========================================
        */

        const existingCategory =
            categories.find(
                category => {

                    const categoryName =
                        category.category_en;


                    if (!categoryName) {

                        return false;

                    }


                    return (
                        categoryName
                            .trim()
                            .toLowerCase() ===
                        subcategory.name
                            .trim()
                            .toLowerCase()
                    );

                }
            );


        /*
            ========================================
            4. CHECK FOR LOCAL DRAFT
            ========================================

            IMPORTANT:

            We check for a local draft BEFORE
            deciding whether to open the category
            as existing or new.

            This prevents local edits from being
            overwritten when the user comes back
            to the category.
        */

        console.log(
            "Checking for local category draft:",
            subcategory.name
        );


        let localDraft = null;


        /*
            Drafts use the key:

                category_draft_<category_id>

            We search by category_en because the
            subcategory currently does not contain
            the Category ID.
        */

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
                    !draft.category_en ||
                    !draft.category_id
                ) {

                    continue;

                }


                const draftCategoryName =
                    draft.category_en
                        .trim()
                        .toLowerCase();


                const currentCategoryName =
                    subcategory.name
                        .trim()
                        .toLowerCase();


                if (
                    draftCategoryName ===
                    currentCategoryName
                ) {

                    localDraft =
                        draft;


                    console.log(
                        "Local category draft found:",
                        localDraft
                    );


                    break;

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


        /*
            ========================================
            5. LOCAL DRAFT FOUND
            ========================================

            A local draft always takes priority.

            This applies to BOTH:

                - Existing categories
                - New categories

            The Category ID from the draft is
            preserved.

            The category-content page will load
            the local draft instead of automatically
            fetching S3.
        */

        if (localDraft) {

            const categoryData = {

                id:
                    localDraft.category_id,

                name:
                    localDraft.category_en,

                nameJp:
                    localDraft.category_jp,

                isNew:
                    !existingCategory

            };


            console.log(
                "Opening local category draft:",
                categoryData
            );


            const module =
                await import(
                    "./category-content-page.js"
                );


            await module.loadCategoryContentPage(
                parentCategory,
                categoryData
            );


            return;

        }


        /*
            ========================================
            6. EXISTING CATEGORY
            ========================================

            The category is registered in
            category-counter.

            IMPORTANT:

            We DO NOT fetch S3 here.

            category-content-page.js will open
            the editor.

            The user can explicitly click
            "Fetch from S3" when they want
            the latest S3 content.
        */

        if (existingCategory) {

            console.log(
                "Category found in category-counter:",
                existingCategory
            );


            const categoryData = {

                id:
                    existingCategory.category_id,

                name:
                    existingCategory.category_en,

                nameJp:
                    existingCategory.category_jp,

                isNew:
                    false

            };


            console.log(
                "Opening existing category without automatic S3 fetch:",
                categoryData
            );


            const module =
                await import(
                    "./category-content-page.js"
                );


            await module.loadCategoryContentPage(
                parentCategory,
                categoryData
            );


            return;

        }


        /*
            ========================================
            7. NEW CATEGORY
            ========================================

            No registered category and no local
            draft were found.

            Therefore generate a new Category ID.
        */

        console.log(
            "No registered category or local draft found. Creating a new category:",
            subcategory.name
        );


        /*
            ========================================
            8. Get next ID
            ========================================
        */

        const nextId =
            Number(
                metadata.next_id
            );


        if (
            !Number.isInteger(nextId) ||
            nextId < 0
        ) {

            throw new Error(
                "Invalid next_id in category-counter."
            );

        }


        /*
            ========================================
            9. Generate new Category ID
            ========================================

            next_id represents the latest/current
            number.

            The new category uses next_id + 1.

            Example:

                next_id = 0
                -> ryukyuAI_001

                next_id = 1
                -> ryukyuAI_002

                next_id = 2
                -> ryukyuAI_003
        */

        const newCategoryNumber =
            nextId + 1;


        const newCategoryId =
            `ryukyuAI_${String(
                newCategoryNumber
            ).padStart(
                3,
                "0"
            )}`;


        console.log(
            "New Category ID generated:",
            newCategoryId
        );


        /*
            ========================================
            10. Prepare new category data
            ========================================
        */

        const categoryData = {

            id:
                newCategoryId,

            name:
                subcategory.name,

            isNew:
                true

        };


        /*
            ========================================
            11. Open Category Content Page
            ========================================
        */

        const module =
            await import(
                "./category-content-page.js"
            );


        await module.loadCategoryContentPage(
            parentCategory,
            categoryData
        );

    }
    catch (error) {

        console.error(
            "Failed to open Category Content Page:",
            error
        );


        alert(
            `Unable to open the Category editor.\n\n${error.message}`
        );

    }

}


/* ========================================
   FAQ
   ======================================== */

async function openFaqEditor(
    parentCategory,
    subcategory
) {

    try {

        /*
            ========================================
            1. Get category-counter
            ========================================

            We use category-counter to determine
            whether the category is registered.

            We DO NOT fetch FAQ data here.

            The FAQ Content Page is responsible
            for loading:

                - local FAQ draft
                - S3 FAQ data when explicitly requested
        */

        const response =
            await fetch(
                "/api/metadata/category-counter"
            );


        if (!response.ok) {

            throw new Error(
                `Failed to fetch category counter: ${response.status}`
            );

        }


        const metadata =
            await response.json();


        /*
            ========================================
            2. Get categories array
            ========================================
        */

        const categories =
            Array.isArray(
                metadata.categories
            )
                ? metadata.categories
                : [];


        /*
            ========================================
            3. Find registered category by name
            ========================================
        */

        const existingCategory =
            categories.find(
                category => {

                    const categoryName =
                        category.category_en;


                    if (!categoryName) {

                        return false;

                    }


                    return (
                        categoryName
                            .trim()
                            .toLowerCase() ===
                        subcategory.name
                            .trim()
                            .toLowerCase()
                    );

                }
            );


        /*
            ========================================
            4. Check for local CATEGORY draft
            ========================================

            A category may exist locally but not
            yet be registered in category-counter.

            Example:

                category_draft_ryukyuAI_002

            In that case, the FAQ page should still
            know that the category exists.
        */

        console.log(
            "FAQ: Checking for local category draft:",
            subcategory.name
        );


        let localCategoryDraft = null;


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


                const draftCategoryName =
                    draft.category_en
                        .trim()
                        .toLowerCase();


                const currentCategoryName =
                    subcategory.name
                        .trim()
                        .toLowerCase();


                if (
                    draftCategoryName ===
                    currentCategoryName
                ) {

                    localCategoryDraft =
                        draft;


                    console.log(
                        "FAQ: Local category draft found:",
                        localCategoryDraft
                    );


                    break;

                }

            }
            catch (error) {

                console.warn(
                    "FAQ: Invalid local category draft:",
                    key,
                    error
                );

            }

        }


        /*
            ========================================
            5. EXISTING CATEGORY
            ========================================

            A category is considered available
            if it exists either in:

                - category-counter
                - local category draft
        */

        if (
            existingCategory ||
            localCategoryDraft
        ) {

            const source =
                existingCategory ||
                localCategoryDraft;


            const categoryData = {

                id:
                    source.category_id,

                name:
                    source.category_en,

                nameJp:
                    source.category_jp,

                isNew:
                    false

            };


            console.log(
                "FAQ: Opening existing category:",
                categoryData
            );


            /*
                ========================================
                Open FAQ Content Page
                ========================================
            */

            const module =
                await import(
                    "./faq-content-page.js"
                );


            await module.loadFAQContentPage(
                parentCategory,
                categoryData
            );


            return;

        }


        /*
            ========================================
            6. NEW CATEGORY
            ========================================

            Category does not exist in:

                - category-counter
                - local category draft

            Therefore:

                - No Category ID
                - No S3 FAQ fetch
                - FAQ page opens disabled
        */

        console.log(
            "FAQ: Category not found locally or in category-counter:",
            subcategory.name
        );


        const categoryData = {

            id:
                null,

            name:
                subcategory.name,

            isNew:
                true

        };


        /*
            ========================================
            Open FAQ Content Page
            ========================================
        */

        const module =
            await import(
                "./faq-content-page.js"
            );


        await module.loadFAQContentPage(
            parentCategory,
            categoryData
        );

    }
    catch (error) {

        console.error(
            "Failed to open FAQ Content Page:",
            error
        );


        alert(
            `Unable to open the FAQ editor.\n\n${error.message}`
        );

    }

}


/* ========================================
   Back
   ======================================== */

async function goBack(
    parentCategory
) {

    try {

        const module =
            await import(
                "./category.js"
            );


        await module.loadCategory(
            parentCategory
        );

    }
    catch (error) {

        console.error(
            "Failed to return to the Category page:",
            error
        );


        alert(
            "Unable to return to the Category page."
        );

    }

}