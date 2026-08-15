const form =
    document.getElementById(
        "riskAssessmentForm"
    );


let currentApplicationId = null;


// ==========================================
// RUN ASSESSMENT
// ==========================================

form.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        // ----------------------------------
        // GET BORROWER DATA
        // ----------------------------------

        const borrower = {

            id:
                Date.now(),


            fullName:
                document
                    .getElementById("fullName")
                    .value
                    .trim(),


            idNumber:
                document
                    .getElementById("omang")
                    .value
                    .trim(),


            employmentStatus:
                document
                    .getElementById("employmentStatus")
                    .value,


            yearsEmployed:
                Number(
                    document
                        .getElementById("yearsEmployed")
                        .value
                ),


            incomeStability:
                document
                    .getElementById("incomeStability")
                    .value,


            monthlyIncome:
                Number(
                    document
                        .getElementById("monthlyIncome")
                        .value
                ),


            monthlyExpenses:
                Number(
                    document
                        .getElementById("monthlyExpenses")
                        .value
                ),


            monthlyDebt:
                Number(
                    document
                        .getElementById("monthlyDebt")
                        .value
                ),


            loanAmount:
                Number(
                    document
                        .getElementById("loanAmount")
                        .value
                ),


            previousLoans:
                Number(
                    document
                        .getElementById("previousLoans")
                        .value
                ),


            latePayments:
                Number(
                    document
                        .getElementById("latePayments")
                        .value
                ),


            previousDefaults:
                Number(
                    document
                        .getElementById("previousDefaults")
                        .value
                ),


            repaymentBehaviour:
                document
                    .getElementById("repaymentBehaviour")
                    .value

        };


        // ----------------------------------
        // VERIFY DATA FIRST
        // ----------------------------------

        const verification =
            verifyBorrower(
                borrower
            );


        showVerification(
            verification
        );


        // ----------------------------------
        // CALCULATE RISK
        // ----------------------------------

        const rules =
            RiskIQStorage.getRules();


        const result =
            calculateRisk(
                borrower,
                rules
            );


        // ----------------------------------
        // SAVE APPLICATION
        // ----------------------------------

        const application = {

            ...borrower,

            score:
                result.score,

            risk:
                result.risk,

            reasoning:
                result.reasoning,

            verificationStatus:
                verification.verified
                    ? "Verified"
                    : "Possible Mismatch",


            verificationMessage:
                verification.message,


            status:
                verification.verified
                    ? "Pending Human Review"
                    : "Verification Review Required",


            date:
                new Date()
                    .toLocaleString()

        };


        RiskIQStorage.saveApplication(
            application
        );


        currentApplicationId =
            application.id;


        // ----------------------------------
        // SHOW RESULT
        // ----------------------------------

        showRiskResult(
            result,
            verification
        );


    }
);



// ==========================================
// VERIFY BORROWER
// ==========================================

function verifyBorrower(borrower) {

    const records =
        RiskIQStorage.getVerificationData();


    const record =
        records.find(
            item =>
                item.idNumber ===
                borrower.idNumber
        );


    // --------------------------------------
    // NO RECORD FOUND
    // --------------------------------------

    if (!record) {

        return {

            verified: false,

            message:
                "No matching borrower record was found. Human verification is required.",

            mismatches: [
                "Identity record not found"
            ]

        };

    }


    const mismatches = [];


    // NAME

    if (
        record.fullName.toLowerCase() !==
        borrower.fullName.toLowerCase()
    ) {

        mismatches.push(
            "Full name does not match stored data"
        );

    }


    // INCOME

    if (
        Number(record.monthlyIncome) !==
        Number(borrower.monthlyIncome)
    ) {

        mismatches.push(
            "Monthly income differs from stored data"
        );

    }


    // DEBT

    if (
        Number(record.monthlyDebt) !==
        Number(borrower.monthlyDebt)
    ) {

        mismatches.push(
            "Monthly debt differs from stored data"
        );

    }


    // EMPLOYMENT

    if (
        record.employmentStatus !==
        borrower.employmentStatus
    ) {

        mismatches.push(
            "Employment status differs from stored data"
        );

    }


    return {

        verified:
            mismatches.length === 0,


        message:
            mismatches.length === 0
                ? "Data verified successfully against available demo records."
                : "Possible data mismatch detected. Human review is required.",


        mismatches:
            mismatches

    };

}



// ==========================================
// SHOW VERIFICATION
// ==========================================

function showVerification(verification) {

    const result =
        document.getElementById(
            "verificationResult"
        );


    if (verification.verified) {

        result.className =
            "verification-result verified";


        result.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>

            <div>
                <strong>DATA VERIFIED</strong>
                <span>
                    ${verification.message}
                </span>
            </div>
        `;

    } else {

        result.className =
            "verification-result mismatch";


        result.innerHTML = `
            <i class="fa-solid fa-triangle-exclamation"></i>

            <div>
                <strong>POSSIBLE DATA MISMATCH</strong>
                <span>
                    ${verification.message}
                </span>
            </div>
        `;

    }

}



// ==========================================
// CALCULATE RISK
// ==========================================

function calculateRisk(
    borrower,
    rules
) {

    let score = 0;


    const reasoning = [];


    rules.forEach(rule => {

        let matched = false;


        // ==============================
        // REPAYMENT BEHAVIOUR
        // ==============================

        if (
            rule.field ===
            "repaymentBehaviour"
        ) {

            matched =
                borrower.repaymentBehaviour ===
                rule.condition;

        }


        // ==============================
        // INCOME STABILITY
        // ==============================

        if (
            rule.field ===
            "incomeStability"
        ) {

            matched =
                borrower.incomeStability ===
                rule.condition;

        }


        // ==============================
        // PREVIOUS DEFAULTS
        // ==============================

        if (
            rule.field ===
            "previousDefaults"
        ) {

            if (
                rule.condition === "zero"
            ) {

                matched =
                    borrower.previousDefaults === 0;

            }

        }


        // ==============================
        // DEBT RATIO
        // ==============================

        if (
            rule.field ===
            "debtRatio"
        ) {

            const debtRatio =
                borrower.monthlyIncome > 0
                    ? borrower.monthlyDebt /
                      borrower.monthlyIncome
                    : 1;


            if (
                rule.condition === "low"
            ) {

                matched =
                    debtRatio < 0.30;

            }

        }


        // ==============================
        // AFFORDABILITY
        // ==============================

        if (
            rule.field ===
            "affordability"
        ) {

            const disposableIncome =
                borrower.monthlyIncome -
                borrower.monthlyExpenses -
                borrower.monthlyDebt;


            if (
                rule.condition === "good"
            ) {

                matched =
                    disposableIncome > 0;

            }

        }


        // ==============================
        // ADD POINTS
        // ==============================

        if (matched) {

            score +=
                Number(rule.points);


            reasoning.push({

                type:
                    "positive",


                title:
                    rule.name,


                text:
                    rule.description

            });

        } else {

            reasoning.push({

                type:
                    "negative",


                title:
                    rule.name,


                text:
                    "The borrower did not meet this configured risk criterion."

            });

        }

    });


    // Keep between 0 and 100

    score =
        Math.max(
            0,
            Math.min(
                100,
                score
            )
        );


    // ==============================
    // RISK LEVEL
    // ==============================

    let risk;


    if (score >= 75) {

        risk =
            "LOW RISK";

    } else if (score >= 50) {

        risk =
            "MEDIUM RISK";

    } else {

        risk =
            "HIGH RISK";

    }


    return {

        score,
        risk,
        reasoning

    };

}



// ==========================================
// SHOW RISK RESULT
// ==========================================

function showRiskResult(
    result,
    verification
) {

    const section =
        document.getElementById(
            "resultSection"
        );


    section.classList.remove(
        "hidden"
    );


    // SCORE

    document.getElementById(
        "riskScore"
    ).textContent =
        result.score;


    // RISK LEVEL

    const level =
        document.getElementById(
            "riskLevel"
        );


    level.textContent =
        result.risk;


    // COLOUR CLASS

    level.className =
        result.risk === "LOW RISK"
            ? "low-risk"
            : result.risk === "MEDIUM RISK"
                ? "medium-risk"
                : "high-risk";


    // SUMMARY

    let summary;


    if (
        result.risk ===
        "LOW RISK"
    ) {

        summary =
            "The borrower meets most configured risk criteria and demonstrates a stronger repayment profile.";

    } else if (
        result.risk ===
        "MEDIUM RISK"
    ) {

        summary =
            "The borrower meets some risk criteria but requires careful review of the weaker financial indicators.";

    } else {

        summary =
            "The borrower meets few configured risk criteria and presents significant lending risk indicators.";

    }


    // ADD VERIFICATION WARNING

    if (!verification.verified) {

        summary +=
            " Data verification also requires human review.";

    }


    document.getElementById(
        "riskSummary"
    ).textContent =
        summary;


    // ==============================
    // SHOW REASONING
    // ==============================

    const reasoningList =
        document.getElementById(
            "reasoningList"
        );


    reasoningList.innerHTML =
        "";


    result.reasoning.forEach(
        item => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                `reasoning-item ${item.type}`;


            div.innerHTML = `

                <i class="
                    fa-solid
                    ${item.type === "positive"
                        ? "fa-circle-check"
                        : "fa-circle-xmark"
                    }
                "></i>

                <div>

                    <strong>
                        ${item.title}
                    </strong>

                    <p>
                        ${item.text}
                    </p>

                </div>

            `;


            reasoningList.appendChild(
                div
            );

        }
    );


    // Scroll to result

    setTimeout(
        () => {

            section.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        },
        200
    );

}



// ==========================================
// HUMAN DECISION
// ==========================================

document
    .getElementById("approveButton")
    .addEventListener(
        "click",
        function () {

            saveHumanDecision(
                "Approved"
            );

        }
    );


document
    .getElementById("reviewButton")
    .addEventListener(
        "click",
        function () {

            saveHumanDecision(
                "Under Review"
            );

        }
    );


document
    .getElementById("declineButton")
    .addEventListener(
        "click",
        function () {

            saveHumanDecision(
                "Declined"
            );

        }
    );



// ==========================================
// SAVE HUMAN DECISION
// ==========================================

function saveHumanDecision(status) {

    if (!currentApplicationId) {

        return;

    }


    RiskIQStorage.updateApplication(
        currentApplicationId,
        {
            status: status,
            humanReviewed: true
        }
    );


    const message =
        document.getElementById(
            "decisionMessage"
        );


    message.textContent =
        `Human decision recorded: ${status}`;


    message.className =
        "decision-message visible";


    if (status === "Approved") {

        message.classList.add(
            "approved-message"
        );

    } else if (status === "Declined") {

        message.classList.add(
            "declined-message"
        );

    } else {

        message.classList.add(
            "review-message"
        );

    }

}
