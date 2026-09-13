/* ========================================
   Category Page
   ======================================== */

let currentParentCategory = null;


/* ========================================
   Session Cache
   ======================================== */

let categoryHtmlCache = null;

let categoryCardsCache = null;


/* ========================================
   Load Category
   ======================================== */

export async function loadCategory(category) {

    /*
        Load category.html only once.
    */

    if (!categoryHtmlCache) {

        const response =
            await fetch(
                "/static/components/category.html"
            );

        if (!response.ok) {

            throw new Error(
                `Failed to load category.html: ${response.status}`
            );

        }

        categoryHtmlCache =
            await response.text();
    }


    document.getElementById(
        "main-content"
    ).innerHTML =
        categoryHtmlCache;


    const categoryName =
        typeof category === "string"
            ? category
            : category.name;


    const categoryId =
        typeof category === "string"
            ? `category_${category}`
            : category.id;


    const parentCategory = {

        id:
            categoryId,

        name:
            categoryName

    };


    currentParentCategory =
        parentCategory;


    document.getElementById(
        "category-title"
    ).textContent =
        categoryName;


    document.getElementById(
        "category-description"
    ).textContent =
        `${categoryName}-related knowledge categories.`;


    await loadSubcategoryCards(

        parentCategory

    );


    setupCategoryPage(

        parentCategory

    );

}


/* ========================================
   Load Subcategory Cards
   ======================================== */

async function loadSubcategoryCards(

    parentCategory

) {

    /*
        Disable Add Category controls
        while loading is happening.
    */

    setCategoryAddLoadingState(true);


    try {

        /*
            If category cards are already cached,

            do not request S3/API again.
        */

        if (categoryCardsCache) {

            console.log(

                "⚡ Using cached category cards"

            );


            const cards =

                categoryCardsCache.filter(

                    card =>

                        card.parent_id ===
                        parentCategory.id

                );


            renderSubcategoryCards(

                cards,

                parentCategory

            );


            return;

        }


        /*
            First load:

            fetch category cards from S3/API.
        */

        console.log(

            "🌐 Fetching category cards from S3/API..."

        );


        const response =

            await fetch(

                "/api/metadata/category-cards"

            );


        if (!response.ok) {

            throw new Error(

                `Failed to fetch category cards: ${response.status}`

            );

        }


        const data =

            await response.json();


        const allCards =

            Array.isArray(data.cards)

                ? data.cards

                : [];


        /*
            Store the complete category card list
            in memory.
        */

        categoryCardsCache =

            allCards;


        /*
            Filter locally for the current
            parent category.
        */

        const cards =

            categoryCardsCache.filter(

                card =>

                    card.parent_id ===
                    parentCategory.id

            );


        renderSubcategoryCards(

            cards,

            parentCategory

        );

    }

    catch (error) {

        console.error(

            "Failed to load category cards:",

            error

        );


        /*
            Hide loader even if loading fails.
        */

        hideCategoryLoader();


        /*
            Re-enable Add Category controls
            if loading fails.
        */

        setCategoryAddLoadingState(false);


        alert(

            "Failed to load category cards."

        );

    }

}


/* ========================================
   Hide Loading Animation
   ======================================== */

function hideCategoryLoader() {

    const loader =

        document.getElementById(

            "category-loader"

        );


    if (loader) {

        loader.style.display =

            "none";

    }

}


/* ========================================
   Add Category Loading State
   ======================================== */

function setCategoryAddLoadingState(

    isLoading

) {

    const addButton =

        document.getElementById(

            "add-subcategory-btn"

        );


    const addCard =

        document.getElementById(

            "add-subcategory-card"

        );


    /*
        Disable / enable the top
        Add Category button.
    */

    if (addButton) {

        addButton.disabled =

            isLoading;

    }


    /*
        Disable / enable the bottom
        Add Category card.
    */

    if (addCard) {

        addCard.disabled =

            isLoading;


        addCard.style.pointerEvents =

            isLoading

                ? "none"

                : "";


        addCard.style.opacity =

            isLoading

                ? "0.5"

                : "";

    }

}


/* ========================================
   Render Subcategory Cards
   ======================================== */

function renderSubcategoryCards(

    cards,

    parentCategory

) {

    const container =

        document.getElementById(

            "subcategory-cards"

        );


    const addCard =

        document.getElementById(

            "add-subcategory-card"

        );


    /*
        Hide loading animation.
    */

    hideCategoryLoader();


    /*
        Loading is finished.

        Re-enable Add Category controls.
    */

    setCategoryAddLoadingState(false);


    container

        .querySelectorAll(

            ".subcategory-card"

        )

        .forEach(

            card =>

                card.remove()

        );


    cards.forEach(

        cardData => {

            const card =

                createSubcategoryCard(

                    cardData

                );


            container.insertBefore(

                card,

                addCard

            );

        }

    );

}


/* ========================================
   Create Subcategory Card
   ======================================== */

function createSubcategoryCard(

    cardData

) {

    const card =

        document.createElement(

            "div"

        );


    card.className =

        "subcategory-card";


    /*
        No category ID is stored here.

        Only the parent ID is needed to know
        which top-level category this card
        belongs to.
    */

    card.dataset.parentId =

        cardData.parent_id || "";


    /*
        Store the original category name.

        This helps us preserve the image even
        if the user later renames the category.
    */

    card.dataset.originalName =

        cardData.name || "";


    /*
        Restore saved image from JSON.
    */

    if (cardData.image) {

        card.style.backgroundImage =

            `url("${cardData.image}")`;

    }


    card.innerHTML = `

        <div class="subcategory-overlay">

            <div class="subcategory-content">

                <h2>

                    ${escapeHtml(

                        cardData.name ||

                        "Untitled"

                    )}

                </h2>


                <p>

                    ${escapeHtml(

                        cardData.description ||

                        ""

                    )}

                </p>


                <div class="subcategory-actions">

                    <button class="go-content-btn">

                        Manage

                    </button>


                    <button class="edit-subcategory-btn">

                        Edit

                    </button>


                    <button class="delete-subcategory-btn">

                        Delete

                    </button>

                </div>

            </div>

        </div>

    `;


    return card;

}


/* ========================================
   Setup
   ======================================== */

function setupCategoryPage(

    parentCategory

) {

    document

        .getElementById(

            "back-to-knowledge-base"

        )

        .addEventListener(

            "click",

            goBack

        );


    document

        .getElementById(

            "add-subcategory-btn"

        )

        .addEventListener(

            "click",

            () =>

                addSubcategory(

                    parentCategory

                )

        );


    document

        .getElementById(

            "add-subcategory-card"

        )

        .addEventListener(

            "click",

            () =>

                addSubcategory(

                    parentCategory

                )

        );


    setupSubcategoryButtons(

        parentCategory

    );

}


/* ========================================
   Existing Buttons
   ======================================== */

function setupSubcategoryButtons(

    parentCategory

) {

    document

        .querySelectorAll(

            ".go-content-btn"

        )

        .forEach(

            button => {

                button.addEventListener(

                    "click",

                    event =>

                        goToManage(

                            event,

                            parentCategory

                        )

                );

            }

        );


    document

        .querySelectorAll(

            ".edit-subcategory-btn"

        )

        .forEach(

            button => {

                button.addEventListener(

                    "click",

                    editSubcategory

                );

            }

        );


    document

        .querySelectorAll(

            ".delete-subcategory-btn"

        )

        .forEach(

            button => {

                button.addEventListener(

                    "click",

                    event =>

                        deleteSubcategory(

                            event,

                            parentCategory

                        )

                );

            }

        );

}


/* ========================================
   Go To Manage
   ======================================== */

async function goToManage(

    event,

    parentCategory

) {

    const card =

        event.currentTarget.closest(

            ".subcategory-card"

        );


    if (!card) {

        return;

    }


    const categoryName =

        card.querySelector(

            "h2"

        )

        .textContent

        .trim();


    /*
        category.js does NOT look up the
        Category ID.

        The card only provides the name.

        The ID will be looked up later in
        manage.js when the user clicks
        the Category button.
    */

    const subcategory = {

        name:

            categoryName

    };


    console.log(

        "Opening Manage:",

        subcategory

    );


    try {

        const module =

            await import(

                "./manage.js"

            );


        await module.loadManagePage({

            parentCategory:

                parentCategory,

            subcategory:

                subcategory

        });

    }

    catch (error) {

        console.error(

            "Failed to open Manage page:",

            error

        );


        alert(

            `Unable to open the Manage page.\n\n${error.message}`

        );

    }

}


/* ========================================
   Edit
   ======================================== */

function editSubcategory(

    event

) {

    const card =

        event.target.closest(

            ".subcategory-card"

        );


    if (!card) {

        return;

    }


    const title =

        card.querySelector(

            "h2"

        );


    const description =

        card.querySelector(

            "p"

        );


    const oldTitle =

        title.textContent.trim();


    const oldDescription =

        description.textContent.trim();


    const oldBackgroundImage =

        card.style.backgroundImage;


    /*
        Keep the original name.

        This is important if the user renames
        the category while editing.
    */

    if (!card.dataset.originalName) {

        card.dataset.originalName =

            oldTitle;

    }


    title.innerHTML = `

        <input

            class="edit-subcategory-title"

            value="${escapeHtml(

                oldTitle

            )}"

        >

    `;


    description.innerHTML = `

        <textarea

            class="edit-subcategory-description"

        >${escapeHtml(

            oldDescription

        )}</textarea>

    `;


    const upload =

        document.createElement(

            "label"

        );


    upload.className =

        "image-upload-label";


    upload.innerHTML = `

        Change Image

        <input

            type="file"

            accept="image/*"

            class="image-upload-input"

        >

    `;


    const content =

        card.querySelector(

            ".subcategory-content"

        );


    const actions =

        card.querySelector(

            ".subcategory-actions"

        );


    content.insertBefore(

        upload,

        actions

    );


    upload

        .querySelector(

            "input"

        )

        .addEventListener(

            "change",

            handleImageUpload

        );


    actions.innerHTML = `

        <button class="save-subcategory-btn">

            Save

        </button>


        <button class="cancel-subcategory-btn">

            Cancel

        </button>

    `;


    actions

        .querySelector(

            ".save-subcategory-btn"

        )

        .addEventListener(

            "click",

            () =>

                saveSubcategory(

                    card,

                    currentParentCategory

                )

        );


    actions

        .querySelector(

            ".cancel-subcategory-btn"

        )

        .addEventListener(

            "click",

            () =>

                cancelSubcategory(

                    card,

                    oldTitle,

                    oldDescription,

                    oldBackgroundImage

                )

        );

}


/* ========================================
   Image Upload Preview
   ======================================== */

function handleImageUpload(

    event

) {

    const file =

        event.target.files[0];


    if (!file) {

        return;

    }


    const card =

        event.target.closest(

            ".subcategory-card"

        );


    if (!card) {

        return;

    }


    const reader =

        new FileReader();


    reader.onload = () => {

        /*
            Store the uploaded image
            temporarily as a data URL.
        */

        card.style.backgroundImage =

            `url("${reader.result}")`;

    };


    reader.readAsDataURL(

        file

    );

}


/* ========================================
   Save Subcategory
   ======================================== */

async function saveSubcategory(

    card,

    parentCategory

) {

    const titleInput =

        card.querySelector(

            ".edit-subcategory-title"

        );


    const descriptionInput =

        card.querySelector(

            ".edit-subcategory-description"

        );


    const title =

        titleInput.value.trim();


    const description =

        descriptionInput.value.trim();


    if (!title) {

        alert(

            "Category name is required."

        );

        return;

    }


    /*
        Update the card displayed on the page.
    */

    card.querySelector(

        "h2"

    ).textContent =

        title;


    card.querySelector(

        "p"

    ).textContent =

        description;


    /*
        Save the complete set of cards
        belonging to this parent category.

        No card ID is required.
    */

    const saved =

        await saveCategoryCards(

            parentCategory

        );


    if (!saved) {

        return;

    }


    /*
        Update the original name after
        successful save.

        This is useful for future edits.
    */

    card.dataset.originalName =

        title;


    restoreButtons(

        card,

        parentCategory

    );

}


/* ========================================
   Get Current Card Image
   ======================================== */

function getCardImage(

    card

) {

    const backgroundImage =

        card.style.backgroundImage;


    if (

        !backgroundImage ||

        backgroundImage === "none"

    ) {

        return "";

    }


    /*
        Extract the actual URL from:

        url("IMAGE")

        or

        url('IMAGE')

        or

        url(IMAGE)
    */

    const match =

        backgroundImage.match(

            /^url\(["']?(.*?)["']?\)$/

        );


    if (match) {

        return match[1];

    }


    return "";

}


/* ========================================
   Save All Category Cards To S3
   ======================================== */

async function saveCategoryCards(

    parentCategory

) {

    try {

        /*
            Use the cached category cards.

            There is NO GET request here.
        */

        if (!categoryCardsCache) {

            throw new Error(

                "Category cards are not loaded in cache."

            );

        }


        const allCards =

            categoryCardsCache;


        const parentId =

            parentCategory.id;


        /*
            Build the cards currently displayed
            for this parent category.
        */

        const currentCards =

            [];


        document

            .querySelectorAll(

                "#subcategory-cards .subcategory-card"

            )

            .forEach(

                card => {

                    const name =

                        card.querySelector(

                            "h2"

                        )

                        .textContent

                        .trim();


                    const description =

                        card.querySelector(

                            "p"

                        )

                        .textContent

                        .trim();


                    /*
                        Original name is used to find
                        the old JSON entry.

                        This means renaming a category
                        will NOT break image preservation.
                    */

                    const originalName =

                        card.dataset.originalName ||

                        name;


                    const existingCard =

                        allCards.find(

                            item =>

                                item.parent_id ===

                                parentId

                                &&

                                item.name ===

                                originalName

                        );


                    /*
                        First get the image currently
                        displayed on the card.

                        This includes a newly uploaded
                        image.
                    */

                    let image =

                        getCardImage(

                            card

                        );


                    /*
                        If there is no current image,
                        preserve the existing saved image.
                    */

                    if (!image) {

                        image =

                            existingCard?.image ||

                            "";

                    }


                    currentCards.push({

                        parent_id:

                            parentId,

                        name:

                            name,

                        description:

                            description,

                        image:

                            image

                    });

                }

            );


        /*
            Keep cards belonging to all the
            other parent categories.
        */

        const otherParentCards =

            allCards.filter(

                item =>

                    item.parent_id !==

                    parentId

            );


        /*
            Replace the current parent's cards
            while keeping other parents' cards.
        */

        const updatedCards = [

            ...otherParentCards,

            ...currentCards

        ];


        /*
            Send the complete updated data
            back to Flask.
        */

        const saveResponse =

            await fetch(

                "/api/metadata/category-cards",

                {

                    method:

                        "PUT",

                    headers: {

                        "Content-Type":

                            "application/json"

                    },

                    body:

                        JSON.stringify({

                            cards:

                                updatedCards

                        })

                }

            );


        if (!saveResponse.ok) {

            throw new Error(

                `Failed to save category cards: ${saveResponse.status}`

            );

        }


        /*
            Update the browser cache after
            successful S3 save.

            Future navigation will now use
            this updated data.
        */

        categoryCardsCache =

            updatedCards;


        return true;

    }

    catch (error) {

        console.error(

            "Failed to save category cards:",

            error

        );


        alert(

            "Failed to save category cards to S3."

        );


        return false;

    }

}


/* ========================================
   Cancel
   ======================================== */

function cancelSubcategory(

    card,

    oldTitle,

    oldDescription,

    oldBackgroundImage

) {

    card.querySelector(

        "h2"

    ).textContent =

        oldTitle;


    card.querySelector(

        "p"

    ).textContent =

        oldDescription;


    card.style.backgroundImage =

        oldBackgroundImage;


    restoreButtons(

        card,

        currentParentCategory

    );

}


/* ========================================
   Restore Buttons
   ======================================== */

function restoreButtons(

    card,

    parentCategory

) {

    const upload =

        card.querySelector(

            ".image-upload-label"

        );


    if (upload) {

        upload.remove();

    }


    const actions =

        card.querySelector(

            ".subcategory-actions"

        );


    actions.innerHTML = `

        <button class="go-content-btn">

            Manage

        </button>


        <button class="edit-subcategory-btn">

            Edit

        </button>


        <button class="delete-subcategory-btn">

            Delete

        </button>

    `;


    actions

        .querySelector(

            ".go-content-btn"

        )

        .addEventListener(

            "click",

            event =>

                goToManage(

                    event,

                    parentCategory

                )

        );


    actions

        .querySelector(

            ".edit-subcategory-btn"

        )

        .addEventListener(

            "click",

            editSubcategory

        );


    actions

        .querySelector(

            ".delete-subcategory-btn"

        )

        .addEventListener(

            "click",

            event =>

                deleteSubcategory(

                    event,

                    parentCategory

                )

        );

}


/* ========================================
   Add Subcategory
   ======================================== */

function addSubcategory(

    parentCategory

) {

    const container =

        document.getElementById(

            "subcategory-cards"

        );


    const addCard =

        document.getElementById(

            "add-subcategory-card"

        );


    const card =

        document.createElement(

            "div"

        );


    card.className =

        "subcategory-card";


    /*
        Only the parent ID is needed.

        There is no subcategory ID.
    */

    card.dataset.parentId =

        parentCategory.id;


    /*
        New card does not have an
        existing JSON name yet.
    */

    card.dataset.originalName =

        "";


    card.innerHTML = `

        <div class="subcategory-overlay">

            <div class="subcategory-content">

                <h2>

                    New Category

                </h2>


                <p>

                    New Category-related

                    information and content.

                </p>


                <div class="subcategory-actions">

                    <button class="go-content-btn">

                        Manage

                    </button>


                    <button class="edit-subcategory-btn">

                        Edit

                    </button>


                    <button class="delete-subcategory-btn">

                        Delete

                    </button>

                </div>

            </div>

        </div>

    `;


    container.insertBefore(

        card,

        addCard

    );


    card

        .querySelector(

            ".go-content-btn"

        )

        .addEventListener(

            "click",

            event =>

                goToManage(

                    event,

                    parentCategory

                )

        );


    card

        .querySelector(

            ".edit-subcategory-btn"

        )

        .addEventListener(

            "click",

            editSubcategory

        );


    card

        .querySelector(

            ".delete-subcategory-btn"

        )

        .addEventListener(

            "click",

            event =>

                deleteSubcategory(

                    event,

                    parentCategory

                )

        );


    /*
        Immediately open edit mode.
    */

    editSubcategory({

        target:

            card.querySelector(

                ".edit-subcategory-btn"

            )

    });

}


/* ========================================
   Delete
   ======================================== */

async function deleteSubcategory(

    event,

    parentCategory

) {

    const card =

        event.target.closest(

            ".subcategory-card"

        );


    if (!card) {

        return;

    }


    const confirmed =

        confirm(

            "Are you sure you want to delete this category?"

        );


    if (!confirmed) {

        return;

    }


    /*
        Remove it from the page first.
    */

    card.remove();


    /*
        Save the remaining cards.

        This works even when the deleted card
        never had an ID.
    */

    const saved =

        await saveCategoryCards(

            parentCategory

        );


    if (!saved) {

        /*
            Clear the cache so that the next
            load gets fresh data from S3.
        */

        categoryCardsCache =

            null;


        await loadCategory(

            parentCategory

        );

    }

}


/* ========================================
   Back
   ======================================== */

async function goBack() {

    try {

        const module =

            await import(

                "./knowledge-base.js"

            );


        await module.loadKnowledgeBase();

    }

    catch (error) {

        console.error(

            "Failed to return to Knowledge Base:",

            error

        );


        alert(

            "Unable to return to the Knowledge Base."

        );

    }

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