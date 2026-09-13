/* ========================================
   Session Cache
   ======================================== */

let knowledgeBaseHtmlCache = null;

let knowledgeBaseCardsCache = null;


/* ========================================
   Load Knowledge Base
   ======================================== */

export async function loadKnowledgeBase() {

    /*
        Load HTML only once.
    */

    if (!knowledgeBaseHtmlCache) {

        const response = await fetch(
            "/static/components/knowledge-base.html"
        );

        if (!response.ok) {

            throw new Error(
                `Failed to load knowledge-base.html: ${response.status}`
            );
        }

        knowledgeBaseHtmlCache =
            await response.text();
    }


    document.getElementById(
        "main-content"
    ).innerHTML =
        knowledgeBaseHtmlCache;


    /*
        Load cards from cache
        or S3/API if not cached.
    */

    await loadKnowledgeBaseCards();


    setupKnowledgeBase();
}


/* ========================================
   Load Cards From S3
   ======================================== */

async function loadKnowledgeBaseCards() {

    /*
        Disable Add Category controls
        while loading is happening.
    */

    setKnowledgeBaseAddLoadingState(true);


    try {

        /*
            Use cached cards if available.
        */

        if (knowledgeBaseCardsCache) {

            renderKnowledgeBaseCards(
                knowledgeBaseCardsCache
            );

            return;
        }


        /*
            First load:
            fetch cards from S3/API.
        */

        const response =
            await fetch(
                "/api/metadata/knowledge-base-cards"
            );


        if (!response.ok) {

            throw new Error(
                `Failed to fetch knowledge base cards: ${response.status}`
            );
        }


        const data =
            await response.json();


        /*
            Store cards in memory.
        */

        knowledgeBaseCardsCache =
            data.cards || [];


        renderKnowledgeBaseCards(
            knowledgeBaseCardsCache
        );


    } catch (error) {

        console.error(
            "Failed to load knowledge base cards:",
            error
        );


        /*
            Hide loader even if loading fails.
        */

        hideKnowledgeBaseLoader();


        /*
            Re-enable Add Category controls
            if loading fails.
        */

        setKnowledgeBaseAddLoadingState(false);


        alert(
            "Failed to load Knowledge Base cards."
        );
    }
}


/* ========================================
   Hide Loading Animation
   ======================================== */

function hideKnowledgeBaseLoader() {

    const loader =
        document.getElementById(
            "knowledge-base-loader"
        );


    if (loader) {

        loader.style.display =
            "none";

    }

}


/* ========================================
   Add Category Loading State
   ======================================== */

function setKnowledgeBaseAddLoadingState(
    isLoading
) {

    const addButton =
        document.getElementById(
            "add-category-btn"
        );


    const addCard =
        document.getElementById(
            "add-category-card"
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
   Render Cards
   ======================================== */

function renderKnowledgeBaseCards(cards) {

    const container =
        document.getElementById(
            "knowledge-cards"
        );


    const addCard =
        document.getElementById(
            "add-category-card"
        );


    /*
        Hide loading animation.
    */

    hideKnowledgeBaseLoader();


    /*
        Loading is finished.

        Re-enable Add Category controls.
    */

    setKnowledgeBaseAddLoadingState(false);


    /*
        Remove any existing knowledge cards.
    */

    container
        .querySelectorAll(
            ".knowledge-card"
        )
        .forEach(card => {

            card.remove();

        });


    /*
        Create cards from S3 data.
    */

    cards.forEach(cardData => {

        const card =
            createKnowledgeCard(
                cardData
            );


        container.insertBefore(
            card,
            addCard
        );

    });
}


/* ========================================
   Create Knowledge Card
   ======================================== */

function createKnowledgeCard(cardData) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "knowledge-card";


    card.dataset.cardId =
        cardData.id;


    card.innerHTML = `

        <div class="knowledge-icon">
            ${escapeHtml(
                cardData.icon || "📁"
            )}
        </div>

        <div class="knowledge-content">

            <h2>
                ${escapeHtml(
                    cardData.name || "Untitled"
                )}
            </h2>

            <p>
                ${escapeHtml(
                    cardData.description || ""
                )}
            </p>

            <div class="knowledge-actions">

                <button class="go-category-btn">
                    Manage
                </button>

                <button class="edit-category-btn">
                    Edit
                </button>

                <button class="delete-category-btn">
                    Delete
                </button>

            </div>

        </div>
    `;


    return card;
}


/* ========================================
   Setup
   ======================================== */

function setupKnowledgeBase() {

    setupGoButtons();

    setupEditButtons();

    setupDeleteButtons();


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
            "add-category-card"
        )
        .addEventListener(
            "click",
            addCategory
        );
}


/* ========================================
   GO
   ======================================== */

function setupGoButtons() {

    document
        .querySelectorAll(
            ".go-category-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                goToCategory
            );

        });
}


async function goToCategory(event) {

    const card =
        event.target.closest(
            ".knowledge-card"
        );


    if (!card) {
        return;
    }


    const categoryId =
        card.dataset.cardId;


    const categoryName =
        card.querySelector(
            "h2"
        )
        .textContent
        .trim();


    const module =
        await import(
            "./category.js"
        );


    await module.loadCategory({

        id:
            categoryId,

        name:
            categoryName

    });
}


/* ========================================
   EDIT
   ======================================== */

function setupEditButtons() {

    document
        .querySelectorAll(
            ".edit-category-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                editCategory
            );

        });
}


function editCategory(event) {

    const card =
        event.target.closest(
            ".knowledge-card"
        );


    if (!card) {
        return;
    }


    const icon =
        card.querySelector(
            ".knowledge-icon"
        );


    const title =
        card.querySelector(
            "h2"
        );


    const description =
        card.querySelector(
            "p"
        );


    const oldIcon =
        icon.textContent.trim();


    const oldTitle =
        title.textContent.trim();


    const oldDescription =
        description.textContent.trim();


    /* ========================================
       Icon / Emoji
       ======================================== */

    icon.innerHTML = `

        <div class="emoji-editor">

            <button
                type="button"
                class="emoji-current-btn"
                title="Choose emoji"
            >
                ${escapeHtml(
                    oldIcon || "📁"
                )}
            </button>

            <div class="emoji-picker">

                <button type="button">🏫</button>
                <button type="button">🎓</button>
                <button type="button">📚</button>
                <button type="button">📖</button>
                <button type="button">🏠</button>
                <button type="button">🏢</button>

                <button type="button">📅</button>
                <button type="button">🎉</button>
                <button type="button">🎊</button>
                <button type="button">🎈</button>
                <button type="button">🏆</button>
                <button type="button">⭐</button>

                <button type="button">🌞</button>
                <button type="button">🌻</button>
                <button type="button">🌍</button>
                <button type="button">✈️</button>
                <button type="button">🚌</button>
                <button type="button">🚗</button>

                <button type="button">💡</button>
                <button type="button">❤️</button>
                <button type="button">💼</button>
                <button type="button">📢</button>
                <button type="button">📋</button>
                <button type="button">📌</button>

                <button type="button">👨‍👩‍👧</button>
                <button type="button">👩‍🏫</button>
                <button type="button">👨‍🎓</button>
                <button type="button">🧑‍🏫</button>
                <button type="button">🧒</button>
                <button type="button">👥</button>

            </div>

        </div>
    `;


    /* ========================================
       Title
       ======================================== */

    title.innerHTML = `

        <input
            class="edit-category-title"
            value="${escapeHtml(oldTitle)}"
        >
    `;


    /* ========================================
       Description
       ======================================== */

    description.innerHTML = `

        <textarea
            class="edit-category-description"
        >${escapeHtml(oldDescription)}</textarea>
    `;


    /* ========================================
       Emoji Picker
       ======================================== */

    const emojiCurrentButton =
        card.querySelector(
            ".emoji-current-btn"
        );


    const emojiPicker =
        card.querySelector(
            ".emoji-picker"
        );


    emojiCurrentButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            emojiPicker.classList.toggle(
                "show"
            );

        }
    );


    emojiPicker
        .querySelectorAll(
            "button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    const selectedEmoji =
                        button.textContent.trim();


                    emojiCurrentButton.textContent =
                        selectedEmoji;


                    emojiPicker.classList.remove(
                        "show"
                    );

                }
            );

        });


    /* ========================================
       Buttons
       ======================================== */

    const actions =
        card.querySelector(
            ".knowledge-actions"
        );


    actions.innerHTML = `

        <button class="save-category-btn">
            Save
        </button>

        <button class="cancel-category-btn">
            Cancel
        </button>
    `;


    actions.querySelector(
        ".save-category-btn"
    ).addEventListener(
        "click",
        () => saveCategory(card)
    );


    actions.querySelector(
        ".cancel-category-btn"
    ).addEventListener(
        "click",
        () => {

            cancelCategory(
                card,
                oldIcon,
                oldTitle,
                oldDescription
            );

        }
    );
}


/* ========================================
   SAVE
   ======================================== */

async function saveCategory(card) {

    const emojiButton =
        card.querySelector(
            ".emoji-current-btn"
        );


    const titleInput =
        card.querySelector(
            ".edit-category-title"
        );


    const descriptionInput =
        card.querySelector(
            ".edit-category-description"
        );


    const icon =
        emojiButton
            ? emojiButton.textContent.trim()
            : "📁";


    const title =
        titleInput.value.trim();


    let description =
        descriptionInput.value.trim();


    if (!title) {

        alert(
            "Category name is required."
        );

        return;
    }


    if (!description) {

        description =
            `${title}-related information and content.`;
    }


    /*
        Existing card
        or new card.
    */

    let cardId =
        card.dataset.cardId;


    /*
        New card gets a unique ID.
    */

    if (!cardId) {

        cardId =
            generateKnowledgeBaseId();

        card.dataset.cardId =
            cardId;
    }


    /*
        Save the visual changes
        immediately to the card.
    */

    card.querySelector(
        ".knowledge-icon"
    ).textContent =
        icon || "📁";


    card.querySelector(
        "h2"
    ).textContent =
        title;


    card.querySelector(
        "p"
    ).textContent =
        description;


    /*
        Save everything to S3.
    */

    const saved =
        await saveKnowledgeBaseCards();


    if (!saved) {
        return;
    }


    restoreCategoryButtons(
        card
    );
}


/* ========================================
   Save All Cards To S3
   ======================================== */

async function saveKnowledgeBaseCards() {

    const cards =
        [];


    document
        .querySelectorAll(
            "#knowledge-cards .knowledge-card"
        )
        .forEach(card => {

            const id =
                card.dataset.cardId;


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


            const icon =
                card.querySelector(
                    ".knowledge-icon"
                )
                .textContent
                .trim();


            if (!id) {
                return;
            }


            cards.push({

                id:
                    id,

                name:
                    name,

                description:
                    description,

                icon:
                    icon || "📁"

            });

        });


    try {

        const response =
            await fetch(
                "/api/metadata/knowledge-base-cards",
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            cards: cards
                        })
                }
            );


        if (!response.ok) {

            throw new Error(
                `Failed to save cards: ${response.status}`
            );
        }


        /*
            Update browser cache
            after successful S3 save.
        */

        knowledgeBaseCardsCache =
            cards;


        return true;


    } catch (error) {

        console.error(
            "Failed to save knowledge base cards:",
            error
        );


        alert(
            "Failed to save Knowledge Base cards to S3."
        );


        return false;
    }
}


/* ========================================
   CANCEL
   ======================================== */

function cancelCategory(
    card,
    oldIcon,
    oldTitle,
    oldDescription
) {

    card.querySelector(
        ".knowledge-icon"
    ).textContent =
        oldIcon;


    card.querySelector(
        "h2"
    ).textContent =
        oldTitle;


    card.querySelector(
        "p"
    ).textContent =
        oldDescription;


    restoreCategoryButtons(
        card
    );
}


/* ========================================
   RESTORE BUTTONS
   ======================================== */

function restoreCategoryButtons(card) {

    const actions =
        card.querySelector(
            ".knowledge-actions"
        );


    actions.innerHTML = `

        <button class="go-category-btn">
            Manage
        </button>

        <button class="edit-category-btn">
            Edit
        </button>

        <button class="delete-category-btn">
            Delete
        </button>
    `;


    actions.querySelector(
        ".go-category-btn"
    ).addEventListener(
        "click",
        goToCategory
    );


    actions.querySelector(
        ".edit-category-btn"
    ).addEventListener(
        "click",
        editCategory
    );


    actions.querySelector(
        ".delete-category-btn"
    ).addEventListener(
        "click",
        deleteCategory
    );
}


/* ========================================
   DELETE
   ======================================== */

function setupDeleteButtons() {

    document
        .querySelectorAll(
            ".delete-category-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                deleteCategory
            );

        });
}


async function deleteCategory(event) {

    const card =
        event.target.closest(
            ".knowledge-card"
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
        Temporarily remove the card.
    */

    card.remove();


    /*
        Save the remaining cards.
    */

    const saved =
        await saveKnowledgeBaseCards();


    /*
        If saving failed, clear the cache
        and reload the real data from S3.
    */

    if (!saved) {

        knowledgeBaseCardsCache = null;

        await loadKnowledgeBase();
    }
}


/* ========================================
   ADD CATEGORY
   ======================================== */

function addCategory() {

    const container =
        document.getElementById(
            "knowledge-cards"
        );


    const addCard =
        document.getElementById(
            "add-category-card"
        );


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "knowledge-card";


    /*
        New cards don't get an ID
        until the user presses Save.
    */

    card.innerHTML = `

        <div class="knowledge-icon">
            📁
        </div>

        <div class="knowledge-content">

            <h2>New Category</h2>

            <p>
                New Category-related
                information and content.
            </p>

            <div class="knowledge-actions">

                <button class="go-category-btn">
                    Manage
                </button>

                <button class="edit-category-btn">
                    Edit
                </button>

                <button class="delete-category-btn">
                    Delete
                </button>

            </div>

        </div>
    `;


    container.insertBefore(
        card,
        addCard
    );


    /*
        Open edit mode immediately.
    */

    editCategory({

        target:
            card.querySelector(
                ".edit-category-btn"
            )

    });
}


/* ========================================
   Generate Knowledge Base ID
   ======================================== */

function generateKnowledgeBaseId() {

    return (
        "knowledge_" +
        Date.now()
    );
}


/* ========================================
   ESCAPE HTML
   ======================================== */

function escapeHtml(value) {

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