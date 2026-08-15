document.addEventListener("DOMContentLoaded", () => {

    const form =
        document.getElementById("assessmentForm");

    const verificationSection =
        document.getElementById("verificationSection");

    const riskSection =
        document.getElementById("riskSection");

    const verificationContent =
        document.getElementById("verificationContent");

    const verificationBadge =
        document.getElementById("verificationBadge");

    const verificationActions =
        document.getElementById("verificationActions");

    const humanVerifyBtn =
        document.getElementById("humanVerifyBtn");


    let currentApplication = null;
    let dataVerified = false;


    // ==========================================
    // GET FORM DATA
    // ==========================================

    function getFormData() {

        const monthlyIncome =
            Number(document.getElementById("monthlyIncome").value);

        const monthlyExpenses =
            Number(document.getElementById("monthlyExpenses").value);

        const monthlyDebt =
            Number(document.getElementById("monthlyDebt").value);

        const loanAmount =
            Number(document.getElementById("loanAmount").value);

        const loanTerm =
            Number(document.getElementById("loanTerm").value);

        const disposableIncome =
            monthlyIncome - monthlyExpenses - monthlyDebt;

        const debtRatio =
            monthlyIncome > 0
                ? (monthlyDebt / monthlyIncome) * 100
                : 100;

        const affordabilityRatio =
            monthlyIncome > 0
                ? (disposableIncome / monthlyIncome) * 100
                : 0;


        return {

            id: Date.now(),

            fullName:
                document.getElementById("fullName").value.trim(),

            idNumber:
                document.getElementById("idNumber").value.trim(),

            phone:
                document.getElementById("phone").value.trim(),

            employmentStatus:
                document.getElementById("employmentStatus").value,

            yearsEmployed:
                Number(
                    document.getElementById("yearsEmployed").value
                ),

            monthlyIncome,

            monthlyExpenses,

            monthlyDebt,

            incomeStability:
                document.getElementById("incomeStability").value,

            loanAmount,

            loanTerm,

            previousLoans:
                Number(
                    document.getElementById("previousLoans").value
                ),

            latePayments:
                Number(
                    document.getElementById("latePayments").value
                ),

            previousDefaults:
                Number(
                    document.getElementById("previousDefaults").value
                ),

            repaymentBehaviour:
                document.getElementById("repaymentBehaviour").value,

            disposableIncome,

            debtRatio,

            affordabilityRatio,

            verificationStatus: "Pending",

            riskScore: 0,

            riskLevel: "",

            reasoning: [],

            decision: "Pending",

            createdAt:
                new Date().toLocaleString()

        };

    }


    // ==========================================
    // VERIFICATION
    // ==========================================

    function verifyBorrower(application) {

        const verificationData =
            RiskIQStorage.getVerificationData();


        const record =
            verificationData.find(item =>
                item.idNumber === application.idNumber
            );


        // RECORD FOUND
        if (record) {

            const nameMatches =
                record.fullName.toLowerCase() ===
                application.fullName.toLowerCase();

            const incomeMatches =
                Number(record.monthlyIncome) ===
                Number(application.monthlyIncome);

            const debtMatches =
                Number(record.monthlyDebt) ===
                Number(application.monthlyDebt);

            const employmentMatches =
                record.employmentStatus ===
                application.employmentStatus;


            const allCorrect =
                nameMatches &&
                incomeMatches &&
                debtMatches &&
                employmentMatches;


            return {

                found: true,

                verified: allCorrect,

                record: record,

                checks: {

                    name: nameMatches,

                    income: incomeMatches,

                    debt: debtMatches,

                    employment: employmentMatches

                }

            };

        }


        // RECORD NOT FOUND
        return {

            found: false,

            verified: false,

            record: null,

            checks: {}

        };

    }


    // ==========================================
    // SHOW VERIFICATION RESULT
    // ==========================================

    function showVerification(result) {

        verificationSection.classList.remove("hidden");

        document.getElementById("step2")
            .classList.add("active");


        if (result.verified) {

            dataVerified = true;

            verificationBadge.textContent =
                "DATA VERIFIED";

            verificationBadge.style.background =
                "#EDF8F2";

            verificationBadge.style.color =
                "#247A57";


            verificationContent.innerHTML = `

                <div class="verification-message verified">

                    <strong>
                        <i class="fa-solid fa-circle-check"></i>
                        Data Verified Successfully
                    </strong>

                    <br>

                    The submitted borrower information matches the
                    available verification record.

                </div>

                <div class="verification-details">

                    <div>
                        <span>Name</span>
                        <strong>✓ Verified</strong>
                    </div>

                    <div>
                        <span>Monthly Income</span>
                        <strong>✓ Verified</strong>
                    </div>

                    <div>
                        <span>Monthly Debt</span>
                        <strong>✓ Verified</strong>
                    </div>

                    <div>
                        <span>Employment</span>
                        <strong>✓ Verified</strong>
                    </div>

                </div>
            `;


            currentApplication.verificationStatus =
                "Verified";


            setTimeout(() => {

                calculateAndShowRisk();

            }, 500);

        }

        else {

            dataVerified = false;

            verificationBadge.textContent =
                "HUMAN REVIEW REQUIRED";

            verificationBadge.style.background =
                "#FFF6E5";

            verificationBadge.style.color =
                "#B97813";


            let message = "";


            if (!result.found) {

                message = `
                    No matching record was found in the demo
                    verification database. A human reviewer must
                    confirm the information before assessment.
                `;

            } else {

                message = `
                    A verification record was found, but some submitted
                    information does not match the stored record.
                    Human review is required.
                `;

            }


            verificationContent.innerHTML = `

                <div class="verification-message unverified">

                    <strong>
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        Verification Requires Review
                    </strong>

                    <br>

                    ${message}

                </div>
            `;


            currentApplication.verificationStatus =
                "Human Review Required";


            verificationActions.classList.remove("hidden");

        }


        verificationSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    // ==========================================
    // HUMAN APPROVES DATA
    // ==========================================

    humanVerifyBtn.addEventListener("click", () => {

        dataVerified = true;

        verificationActions.classList.add("hidden");

        verificationBadge.textContent =
            "HUMAN VERIFIED";

        verificationBadge.style.background =
            "#EDF8F2";

        verificationBadge.style.color =
            "#247A57";


        currentApplication.verificationStatus =
            "Human Verified";


        verificationContent.innerHTML += `

            <div class="verification-message verified"
                 style="margin-top:15px;">

                <strong>
                    <i class="fa-solid fa-user-check"></i>
                    Human Review Approved
                </strong>

                <br>

                The reviewer has approved the borrower information.
                Risk assessment can now continue.

            </div>
        `;


        calculateAndShowRisk();

    });


    // ==========================================
    // RISK ENGINE
    // ==========================================

    function calculateRisk(application) {

        const rules =
            RiskIQStorage.getRules();


        let score = 0;

        let reasoning = [];


        rules.forEach(rule => {

            let rulePassed = false;


            // -------------------------------
            // REPAYMENT BEHAVIOUR
            // -------------------------------

            if (
                rule.field ===
                "repaymentBehaviour"
            ) {

                if (
                    application.repaymentBehaviour ===
                    rule.condition
                ) {

                    rulePassed = true;

                }

            }


            // -------------------------------
            // INCOME STABILITY
            // -------------------------------

            if (
                rule.field ===
                "incomeStability"
            ) {

                if (
                    application.incomeStability ===
                    rule.condition
                ) {

                    rulePassed = true;

                }

            }


            // -------------------------------
            // PREVIOUS DEFAULTS
            // -------------------------------

            if (
                rule.field ===
                "previousDefaults"
            ) {

                if (
                    rule.condition === "zero" &&
                    application.previousDefaults === 0
                ) {

                    rulePassed = true;

                }

            }


            // -------------------------------
            // DEBT RATIO
            // -------------------------------

            if (
                rule.field ===
                "debtRatio"
            ) {

                if (
                    rule.condition === "low" &&
                    application.debtRatio <= 30
                ) {

                    rulePassed = true;

                }

            }


            // -------------------------------
            // AFFORDABILITY
            // -------------------------------

            if (
                rule.field ===
                "affordability"
            ) {

                if (
                    rule.condition === "good" &&
                    application.affordabilityRatio >= 30
                ) {

                    rulePassed = true;

                }

            }


            // -------------------------------
            // CUSTOM RULES
            // -------------------------------

            if (
                rule.field === "latePayments"
            ) {

                if (
                    rule.condition === "low" &&
                    application.latePayments <= 2
                ) {

                    rulePassed = true;

                }

            }


            if (
                rule.field === "yearsEmployed"
            ) {

                if (
                    rule.condition === "experienced" &&
                    application.yearsEmployed >= 2
                ) {

                    rulePassed = true;

                }

            }


            // -------------------------------
            // ADD POINTS
            // -------------------------------

            if (rulePassed) {

                score += Number(rule.points);


                reasoning.push({

                    positive: true,

                    title: rule.name,

                    description:
                        rule.description +
                        " +" +
                        rule.points +
                        " points."

                });

            }

            else {

                reasoning.push({

                    positive: false,

                    title: rule.name,

                    description:
                        "This rule was not fully satisfied. " +
                        "No points were added."

                });

            }

        });


        // NEVER ABOVE 100

        score = Math.min(
            Math.max(score, 0),
            100
        );


        // RISK LEVEL

        let riskLevel = "";


        if (score >= 75) {

            riskLevel = "LOW RISK";

        }

        else if (score >= 50) {

            riskLevel = "MEDIUM RISK";

        }

        else {

            riskLevel = "HIGH RISK";

        }


        // ADD IMPORTANT EXTRA EXPLANATIONS

        if (
            application.previousDefaults > 0
        ) {

            reasoning.unshift({

                positive: false,

                title: "Previous Default History",

                description:
                    application.previousDefaults +
                    " previous default(s) recorded. " +
                    "This increases lending risk."

            });

        }


        if (
            application.latePayments > 2
        ) {

            reasoning.unshift({

                positive: false,

                title: "Late Payment Pattern",

                description:
                    application.latePayments +
                    " late payments were reported, " +
                    "indicating weaker repayment behaviour."

            });

        }


        if (
            application.debtRatio > 40
        ) {

            reasoning.unshift({

                positive: false,

                title: "High Debt-to-Income Burden",

                description:
                    "Debt represents " +
                    application.debtRatio.toFixed(1) +
                    "% of monthly income, reducing repayment capacity."

            });

        }


        return {

            score,

            riskLevel,

            reasoning

        };

    }


    // ==========================================
    // SHOW RISK
    // ==========================================

    function calculateAndShowRisk() {

        if (!dataVerified) return;


        const result =
            calculateRisk(currentApplication);


        currentApplication.riskScore =
            result.score;

        currentApplication.riskLevel =
            result.riskLevel;

        currentApplication.reasoning =
            result.reasoning;


        document.getElementById("step3")
            .classList.add("active");


        riskSection.classList.remove("hidden");


        animateScore(result.score);


        const riskLevel =
            document.getElementById("riskLevel");


        riskLevel.textContent =
            result.riskLevel;


        if (result.riskLevel === "LOW RISK") {

            riskLevel.style.background =
                "#EDF8F2";

            riskLevel.style.color =
                "#247A57";

        }

        else if (
            result.riskLevel === "MEDIUM RISK"
        ) {

            riskLevel.style.background =
                "#FFF6E5";

            riskLevel.style.color =
                "#B97813";

        }

        else {

            riskLevel.style.background =
                "#FFF0F0";

            riskLevel.style.color =
                "#B84040";

        }


        const reasoningList =
            document.getElementById("reasoningList");


        reasoningList.innerHTML = "";


        result.reasoning.forEach(item => {

            const icon =
                item.positive
                    ? "fa-circle-check"
                    : "fa-circle-exclamation";


            reasoningList.innerHTML += `

                <div class="reasoning-item">

                    <i class="fa-solid ${icon}"></i>

                    <div>

                        <strong>
                            ${item.title}
                        </strong>

                        <p>
                            ${item.description}
                        </p>

                    </div>

                </div>

            `;

        });


        riskSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    // ==========================================
    // SCORE ANIMATION
    // ==========================================

    function animateScore(targetScore) {

        const scoreElement =
            document.getElementById("riskScore");


        let currentScore = 0;


        const interval = setInterval(() => {

            currentScore++;

            scoreElement.textContent =
                currentScore;


            if (
                currentScore >= targetScore
            ) {

                clearInterval(interval);

            }

        }, 15);

    }


    // ==========================================
    // FORM SUBMIT
    // ==========================================

    form.addEventListener("submit", event => {

        event.preventDefault();


        verificationSection.classList.add("hidden");

        riskSection.classList.add("hidden");

        verificationActions.classList.add("hidden");


        dataVerified = false;


        currentApplication =
            getFormData();


        const verificationResult =
            verifyBorrower(currentApplication);


        showVerification(
            verificationResult
        );

    });


    // ==========================================
    // HUMAN FINAL DECISION
    // ==========================================

    document
        .querySelectorAll(".decision")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    if (!currentApplication) return;


                    const decision =
                        button.dataset.decision;


                    currentApplication.decision =
                        decision;


                    currentApplication.reviewedAt =
                        new Date().toLocaleString();


                    RiskIQStorage.saveApplication(
                        currentApplication
                    );


                    document.getElementById("step4")
                        .classList.add("active");


                    alert(
                        "Decision saved successfully: " +
                        decision
                    );


                    window.location.href =
                        "loan-applications.html";

                }
            );

        });

});
