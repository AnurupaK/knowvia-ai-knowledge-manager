export async function loadSidebar() {

    const response = await fetch("/static/components/sidebar.html");

    const sidebarHTML = await response.text();

    document.getElementById("sidebar-container").innerHTML = sidebarHTML;

}