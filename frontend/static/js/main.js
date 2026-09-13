import { loadSidebar } from "./sidebar.js";
import { loadDashboard } from "./dashboard.js";
import { loadKnowledgeBase } from "./knowledge-base.js";
import { loadMetadata } from "./metadata.js";


async function startApp() {

    await loadSidebar();

    await loadDashboard();

    setupNavigation();

}


function setupNavigation() {

    const links =
        document.querySelectorAll(".sidebar-link");


    links.forEach(link => {

        link.addEventListener("click", async (event) => {

            event.preventDefault();


            const page =
                link.dataset.page;


            // Remove active from all links

            links.forEach(item => {

                item.classList.remove("active");

            });


            // Add active to clicked link

            link.classList.add("active");


            // Load selected page

            if (page === "dashboard") {

                await loadDashboard();

            }


            if (page === "knowledge-base") {

                await loadKnowledgeBase();

            }


            if (page === "metadata") {

                await loadMetadata();

            }

        });

    });

}


startApp();