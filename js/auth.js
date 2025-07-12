function registerUser() {
    
}

function passwordStrength() {

    const password = document.getElementById("reg-password").value;
    
    if (password.length < 8) {
        resetPasswordUI();
        return;
    }

    const containsLetters = /[a-zA-Z]/.test(password);
    const containsNumbers = /[0-9]/.test(password);
    const containsSymbols = /[^a-zA-Z0-9]/.test(password);

    let strength;
    if (containsLetters && containsNumbers && containsSymbols) {
        strength = "strong";
    } else if ( (containsLetters && containsNumbers && !containsSymbols) ||
                (containsLetters && !containsNumbers && containsSymbols) ||
                (!containsLetters && containsNumbers && containsSymbols) ) {
        strength = "medium";
    } else if (containsLetters || containsNumbers || containsSymbols) {
        strength = "weak";
    } else {
        strength = "invalid";
    }
    
    updatePasswordUI(strength);
}

function updatePasswordUI(strength) {
    const elements = {
        label: document.getElementById("password-strength-label"),
        containers: document.getElementById("password-strength"),
        indicators: [
            document.getElementById("weak-password-indicator"),
            document.getElementById("medium-password-indicator"),
            document.getElementById("strong-password-indicator")
        ]
    };

    const config = {
        strong: {
            text: "Strong Password",
            color: "var(--success)",
            activeIndicators: 3
        },
        medium: {
            text: "Medium Password",
            color: "var(--info)",
            activeIndicators: 2
        },
        weak: {
            text: "Weak Password",
            color: "var(--warning)",
            activeIndicators: 1
        },
        invalid: {
            text: "Password Strength",
            color: "var(--text-secondary)",
            containerColor: "var(--error)",
            activeIndicators: 0
        }
    };

    const settings = config[strength];
    const containerColor = settings.containerColor || settings.color;

    elements.label.textContent = settings.text;
    elements.label.style.color = settings.color;

    elements.containers.style.borderColor = containerColor;
    elements.containers.style.boxShadow = `0 0 5px ${containerColor}, inset 0 0 5px ${containerColor}`;

    elements.indicators.forEach((indicators, index) => {
        if (index < settings.activeIndicators) {

            indicators.style.backgroundColor = "var(--success)";
            indicators.style.boxShadow = "0 0 7px var(--success)";
        } else {
            indicators.style.backgroundColor = strength === "invalid" ? "var(--error)" : "";
            indicators.style.boxShadow = strength === "invalid" ? "0 0 7px var(--error)" : "";
        }
    })
}

function resetPasswordUI() {
    updatePasswordUI("invalid");
}

function passwordMatch() {
    const password = document.getElementById("reg-password").value;
    const confirmPassword = document.getElementById("reg-confirm-password").value;

    if (password !== confirmPassword) {
        const alertMessage = document.getElementById("reg-alert-message");
        alertMessage.textContent = "Passwords do not match!";
    } else {
        const alertMessage = document.getElementById("reg-alert-message");
        alertMessage.textContent = "";
    }
}

// ANIMATIONS AND TRANSITIONS FOR THE AUTHENTICATION FORMS

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

        document.getElementById("reg-form").reset();

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

        document.getElementById("login-form").reset();
    }

}

function togglePasswordVisibility() {
    
    const isRegContainerActive = document.getElementById("registration-container").classList.contains("active");

    if (isRegContainerActive) {
        toggleRegPassword();
    } else {
        toggleLoginPassword();
    }
}

function toggleRegPassword() {
    const eyeIcon = document.getElementById("reg-eye-icon");

    eyeIcon.classList.add("changing");

    setTimeout(() => {
        if (eyeIcon.classList.contains("fa-eye")) { // If the eye icon is currently showing an open eye :::
            eyeIcon.classList.remove("fa-eye");
            eyeIcon.classList.add("fa-eye-slash");
            document.getElementById("reg-password").type = "text";
            document.getElementById("reg-confirm-password").type = "text";
        } else { // If the eye icon is currently showing a closed eye :::
            eyeIcon.classList.remove("fa-eye-slash");
            eyeIcon.classList.add("fa-eye");
            document.getElementById("reg-password").type = "password";
            document.getElementById("reg-confirm-password").type = "password";
        }

        eyeIcon.classList.remove("changing");
    }, 100);
}

function toggleLoginPassword() { 
    const eyeIcon = document.getElementById("login-eye-icon");

    eyeIcon.classList.add("changing");

    setTimeout(() => {
        if (eyeIcon.classList.contains("fa-eye")) { // If the eye icon is currently showing an open eye :::
            eyeIcon.classList.remove("fa-eye");
            eyeIcon.classList.add("fa-eye-slash");
            document.getElementById("login-password").type = "text";
        } else { // If the eye icon is currently showing a closed eye :::
            eyeIcon.classList.remove("fa-eye-slash");
            eyeIcon.classList.add("fa-eye");
            document.getElementById("login-password").type = "password";
        }

        eyeIcon.classList.remove("changing");
    }, 100);
}
    

// Event Listener Bindings

// Switching between registration and login forms
document.getElementById("switch-a").addEventListener("click", switchForm);
document.getElementById("switch-b").addEventListener("click", switchForm);

// Toggling password visibility
document.getElementById("reg-toggle-password").addEventListener("click", togglePasswordVisibility);
document.getElementById("login-toggle-password").addEventListener("click", togglePasswordVisibility);

// Password strength validation
document.getElementById("reg-password").addEventListener("input", passwordStrength);

// Password match validation
document.getElementById("reg-password").addEventListener("input", passwordMatch);
document.getElementById("reg-confirm-password").addEventListener("input", passwordMatch);