function switchForm() {
    const regContainer = document.getElementById("registration-container");
    const loginContainer = document.getElementById("login-container");

    if (!regContainer || !loginContainer) {
        console.error("One or both containers not found!");
        return;
    }

    const regOrder = window.getComputedStyle(regContainer).order;
    let regFocused = regOrder === "0";

    if (regFocused) {
        // Switch to login form
        regContainer.style.order = "1";
        loginContainer.style.order = "0";

        regContainer.style.opacity = "0";
        loginContainer.style.opacity = "1";

    } else {
        // Switch to registration form
        regContainer.style.order = "0";
        loginContainer.style.order = "1";

        loginContainer.style.opacity = "0";
        regContainer.style.opacity = "1";
    }

}

document.getElementById("switch-a").addEventListener("click", switchForm);
document.getElementById("switch-b").addEventListener("click", switchForm);