export async function loadDashboard() {

    const response = await fetch("/static/components/dashboard.html");

    const dashboardHTML = await response.text();

    document.getElementById("main-content").innerHTML = dashboardHTML;

}