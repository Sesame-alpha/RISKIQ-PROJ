const RiskIQStorage = {

    // ================= USERS =================

    users: [
        {
            username: "codecatalysts",
            password: "1111",
            name: "CodeCatalysts"
        }
    ],


    // ================= LOGIN =================

    login(username, password) {

        const user = this.users.find(
            user =>
                user.username === username &&
                user.password === password
        );

        if (user) {

            localStorage.setItem(
                "riskiq_logged_in",
                "true"
            );

            localStorage.setItem(
                "riskiq_user",
                JSON.stringify(user)
            );

            return {
                success: true,
                user: user
            };

        }

        return {
            success: false
        };

    },


    logout() {

        localStorage.removeItem("riskiq_logged_in");
        localStorage.removeItem("riskiq_user");

        window.location.href = "login.html";

    },


    isLoggedIn() {

        return localStorage.getItem(
            "riskiq_logged_in"
        ) === "true";

    },


    protectPage() {

        if (!this.isLoggedIn()) {

            window.location.href = "login.html";

        }

    },


    // ================= GET DATA =================

    get(key) {

        return JSON.parse(
            localStorage.getItem(key)
        ) || [];

    },


    save(key, data) {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

    },


    // ================= APPLICATIONS =================

    getApplications() {

        return this.get("riskiq_applications");

    },


    saveApplication(application) {

        const applications =
            this.getApplications();

        applications.unshift(application);

        this.save(
            "riskiq_applications",
            applications
        );

    },


    // ================= RISK RULES =================

    getRules() {

        let rules = this.get("riskiq_rules");

        if (rules.length === 0) {

            rules = [

                {
                    id: 1,
                    name: "Repayment Behaviour",
                    field: "repaymentBehaviour",
                    condition: "excellent",
                    points: 20,
                    description:
                        "Good repayment behaviour increases the score."
                },

                {
                    id: 2,
                    name: "Income Stability",
                    field: "incomeStability",
                    condition: "stable",
                    points: 20,
                    description:
                        "Stable income improves repayment capacity."
                },

                {
                    id: 3,
                    name: "No Previous Defaults",
                    field: "previousDefaults",
                    condition: "zero",
                    points: 20,
                    description:
                        "No previous defaults reduces lending risk."
                },

                {
                    id: 4,
                    name: "Low Debt Burden",
                    field: "debtRatio",
                    condition: "low",
                    points: 20,
                    description:
                        "Low debt relative to income improves affordability."
                },

                {
                    id: 5,
                    name: "Strong Affordability",
                    field: "affordability",
                    condition: "good",
                    points: 20,
                    description:
                        "Good disposable income improves affordability."
                }

            ];

            this.save("riskiq_rules", rules);

        }

        return rules;

    },


    saveRules(rules) {

        this.save("riskiq_rules", rules);

    },


    // ================= DEMO VERIFICATION DATA =================

    getVerificationData() {

        let data = this.get(
            "riskiq_verification_data"
        );

        if (data.length === 0) {

            data = [

                {
                    idNumber: "123456789",
                    fullName: "John Molefe",
                    monthlyIncome: 8500,
                    monthlyDebt: 1200,
                    employmentStatus: "employed"
                },

                {
                    idNumber: "987654321",
                    fullName: "Sarah Baebele",
                    monthlyIncome: 12000,
                    monthlyDebt: 2500,
                    employmentStatus: "business-owner"
                },

                {
                    idNumber: "456789123",
                    fullName: "David Kgosi",
                    monthlyIncome: 6000,
                    monthlyDebt: 1800,
                    employmentStatus: "self-employed"
                }

            ];

            this.save(
                "riskiq_verification_data",
                data
            );

        }

        return data;

    }

};


window.RiskIQStorage = RiskIQStorage;
