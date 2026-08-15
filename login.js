const loginForm =
    document.getElementById("loginForm");


loginForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const username =
            document
                .getElementById("username")
                .value
                .trim();

        const password =
            document
                .getElementById("password")
                .value;

        const result =
            RiskIQStorage.login(
                username,
                password
            );

        const message =
            document.getElementById(
                "loginMessage"
            );

        if (result.success) {

            message.textContent =
                "Login successful. Opening dashboard...";

            message.className =
                "login-message success";

            setTimeout(
                () => {

                    window.location.href =
                        "index.html";

                },
                700
            );

        } else {

            message.textContent =
                "Incorrect username or password.";

            message.className =
                "login-message error";

        }

    }
);
