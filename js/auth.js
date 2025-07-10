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
        
        if (regContainer.classList.contains("active")) {
            regContainer.classList.remove("active");
        }

        regContainer.style.order = "1";
        regContainer.style.opacity = "0";
        regContainer.classList.add("inactive");
        
        if (loginContainer.classList.contains("inactive")) {
            loginContainer.classList.remove("inactive");
        }

        loginContainer.style.order = "0";
        loginContainer.style.opacity = "1";
        loginContainer.classList.add("active");

    } else {
        
        if (loginContainer.classList.contains("active")) {
            loginContainer.classList.remove("active");
        }

        loginContainer.style.order = "1";
        loginContainer.style.opacity = "0";
        loginContainer.classList.add("inactive");

        if (regContainer.classList.contains("inactive")) {
            regContainer.classList.remove("inactive");
        }

        regContainer.style.order = "0";
        regContainer.style.opacity = "1";
        regContainer.classList.add("active");

    }

}

// Event Listener Bindings

document.getElementById("switch-a").addEventListener("click", switchForm);
document.getElementById("switch-b").addEventListener("click", switchForm);