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
        category-counter when the user clicks
        the "Category" or "FAQ" button.
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
            3. Find category by name
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
            4. Existing Category
            ========================================
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
            5. NEW CATEGORY
            ========================================
        */

        console.log(
            "New category detected:",
            subcategory.name
        );


        /*
            ========================================
            6. Get next ID
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
            7. Generate new Category ID
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
            8. Prepare new category data
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
            9. Open Category Content Page
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

            We only use category-counter to find
            the Category ID.

            We DO NOT fetch FAQ data here.

            The FAQ Content Page is responsible
            for checking:

                1. Does category content exist?
                2. Does FAQ content exist?
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
            3. Find category by name
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
            4. Existing Category
            ========================================
        */

        if (existingCategory) {

            console.log(
                "FAQ: Category found:",
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
            5. NEW CATEGORY
            ========================================

            Category does not exist in
            category-counter.

            Therefore:

                - No S3 FAQ fetch
                - No fake Category ID
                - FAQ page still opens
                - FAQ page will be disabled
                  except Back
        */

        console.log(
            "FAQ: Category not found in category-counter:",
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