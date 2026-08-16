RiskIQStorage.protectPage();

const applications = RiskIQStorage.getApplications();

document.getElementById("totalApplications").textContent =
    applications.length;

document.getElementById("approvedApplications").textContent =
    applications.filter(app =>
        app.decision === "APPROVED"
    ).length;

document.getElementById("declinedApplications").textContent =
    applications.filter(app =>
        app.decision === "DECLINED"
    ).length;

document.getElementById("highRiskApplications").textContent =
    applications.filter(app =>
        app.risk === "HIGH RISK"
    ).length;


const recentContainer =
    document.getElementById("recentApplications");


if (applications.length === 0) {

    recentContainer.innerHTML = `
        <p class="empty">
            No borrower assessments have been completed yet.
        </p>
    `;

} else {

    recentContainer.innerHTML =
        applications.slice(0, 5).map(app => `

        <div class="application-row">

            <div class="app-person">
                <div class="small-avatar">
                    ${app.fullName.charAt(0).toUpperCase()}
                </div>

                <div>
                    <strong>${app.fullName}</strong>
                    <small>${app.idNumber || "No ID"}</small>
                </div>
            </div>

            <div>
                <span class="score">${app.score}/100</span>
            </div>

            <span class="risk ${app.risk.replace(" ", "-").toLowerCase()}">
                ${app.risk}
            </span>

        </div>

    `).join("");

}
