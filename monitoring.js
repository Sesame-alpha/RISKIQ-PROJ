RiskIQStorage.protectPage();

const applications =
    RiskIQStorage.getApplications();


const critical =
    applications.filter(app =>
        app.risk === "HIGH RISK"
    );

const late =
    applications.filter(app =>
        Number(app.latePayments || 0) > 0
    );


document.getElementById("criticalCount").textContent =
    critical.length;

document.getElementById("lateCount").textContent =
    late.length;

document.getElementById("monitoredCount").textContent =
    applications.length;


const alertsList =
    document.getElementById("alertsList");


if (applications.length === 0) {

    alertsList.innerHTML = `
        <div class="no-alerts">
            <i class="fa-solid fa-shield-halved"></i>
            <h3>No borrowers to monitor yet</h3>
            <p>
                Complete a risk assessment to begin portfolio monitoring.
            </p>
        </div>
    `;

} else {

    const alerts = [];


    applications.forEach(app => {

        if (app.risk === "HIGH RISK") {

            alerts.push({
                type: "critical",
                icon: "fa-triangle-exclamation",
                title: "Potential Default Risk",
                message:
                    `${app.fullName} has a HIGH RISK score of ${app.score}/100 and requires immediate human review.`,
                borrower: app.fullName,
                number: app.idNumber || "Not available"
            });

        }


        if (Number(app.latePayments || 0) > 0) {

            alerts.push({
                type: "warning",
                icon: "fa-clock",
                title: "Late Payment Behaviour",
                message:
                    `${app.fullName} has ${app.latePayments} recorded late payment(s).`,
                borrower: app.fullName,
                number: app.idNumber || "Not available"
            });

        }


        if (app.risk === "MEDIUM RISK") {

            alerts.push({
                type: "medium",
                icon: "fa-eye",
                title: "Monitor Closely",
                message:
                    `${app.fullName} has a MEDIUM RISK score of ${app.score}/100.`,
                borrower: app.fullName,
                number: app.idNumber || "Not available"
            });

        }

    });


    if (alerts.length === 0) {

        alertsList.innerHTML = `
            <div class="no-alerts">
                <i class="fa-solid fa-circle-check"></i>
                <h3>No active risk alerts</h3>
                <p>The monitored portfolio currently has no flagged issues.</p>
            </div>
        `;

    } else {

        alertsList.innerHTML =
            alerts.map(alert => `

            <div class="alert-card ${alert.type}">

                <div class="alert-icon">
                    <i class="fa-solid ${alert.icon}"></i>
                </div>

                <div class="alert-content">

                    <div class="alert-top">

                        <div>
                            <h3>${alert.title}</h3>
                            <p>${alert.message}</p>
                        </div>

                        <span class="alert-badge">
                            ACTIVE
                        </span>

                    </div>

                    <div class="borrower-info">

                        <span>
                            <i class="fa-solid fa-user"></i>
                            ${alert.borrower}
                        </span>

                        <span>
                            <i class="fa-solid fa-id-card"></i>
                            ${alert.number}
                        </span>

                    </div>

                </div>

            </div>

        `).join("");

    }

}
