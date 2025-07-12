async function registerUser() {
    let uuid;
    do {
        uuid = crypto.randomUUID();
    } while (!checkUUIDAvailability(uuid));

    const username = document.getElementById("reg-username").value;

    let usernameAvailability = await checkUsernameAvailability(username);
    if (!usernameAvailability) {
        printErrorMessage("Username is already taken!", true);

        setTimeout(() => {
            printErrorMessage("", true);
        }, 5000);

        document.getElementById("register").classList.add("disabled");
        return;
    }

    const password = document.getElementById("reg-password").value;
    const hashedPassword = await hashPassword(password);

    let params = new URLSearchParams();
    params.append("query", `INSERT INTO Users (userID, username, password) VALUES ('${uuid}', '${username}', '${hashedPassword}');`);

    executeQuery(params);
    document.getElementById("reg-form").reset();
    resetPasswordUI();
}

//
// Username Validation Main Function
//

function usernameValidation() {
    const username = document.getElementById("reg-username").value;

    if (username.length < 4) {
        printErrorMessage("Username must be at least 4 characters long!", true);
        document.getElementById("register").classList.add("disabled");
    } else if (username.length == 0) {
        printErrorMessage("", true);
        document.getElementById("register").classList.add("disabled");
    } else {
        printErrorMessage("", true);
        document.getElementById("register").classList.remove("disabled");
    }
}

// UUID Availability Check Function
// While the likelyhood of UUID collisions is extremely low, this function can be used to check if a UUID is already in use.

async function checkUUIDAvailability(uuid) {
    let params = new URLSearchParams();
    params.append("query", `SELECT CASE WHEN COUNT(*) = 0 THEN 'AVAILABLE' ELSE 'UNAVAILABLE' END AS availability FROM Users WHERE userID = '${uuid}';`);

    executeQuery(params)
        .then(result => {
            if (result.availability != "AVAILABLE") {
                return false;
            } 
        });
    
    return true;
}

async function checkUsernameAvailability(username) {
    let params = new URLSearchParams();
    params.append("query", `SELECT CASE WHEN COUNT(*) = 0 THEN 'AVAILABLE' ELSE 'UNAVAILABLE' END AS availability FROM Users WHERE username = '${username}';`);

    executeQuery(params)
        .then(result => {
            if (result.availability != "AVAILABLE") {
                return false;
            }
            else {
                return true;
            }
        })
}

//
// Database Query Execution Function
//

async function executeQuery(params) {
    let url = "https://amakay01.webhosting1.eeecs.qub.ac.uk/dbConnector.php";
    try {
        let response = await fetch(url, {
            method: "POST",
            body: params,
        });

        let result = await response.json();

        console.log("Query executed successfully:", result);
        
        return result;
    } catch (err) {
        console.error("Error executing query:", error);
    }
}

//
// Password Hashing Function using Argon2
//

async function hashPassword(password) {
    console.log(typeof password);
    console.log(password.length);
    console.log(password);

    try {
        const hash = await argon2.hash({
            pass: password,
            type: argon2.ArgonType.Argon2id,
            salt: new Uint8Array(8),
            time: 3,
            mem: 64 * 1024, // 64 MB
            parallelism: 1,
            hashLen: 32, // 32 bytes
        });
        return hash.encoded;
    } catch (err) {
        console.error("Error hashing password:", err);
    }
}

//
// Password Validation Main Function
//

function passwordValidation() {
    const password = document.getElementById("reg-password").value;
    const confirmPassword = document.getElementById("reg-confirm-password").value;

    if (password.length > 0 && password.length < 8) {
        printErrorMessage("Password must be at least 8 characters long!", true);
        resetPasswordUI();
        document.getElementById("register").classList.add("disabled");
        return false;
    } else if (password.length == 0) {
        printErrorMessage("", true);
        document.getElementById("register").classList.add("disabled");
        return false;
    } else {
        document.getElementById("reg-confirm-password").setAttribute("minlength", password.length);
    }

    passwordStrength(password);
    let passwordsMatch = passwordMatch(password, confirmPassword);
    if (passwordsMatch) {
        document.getElementById("register").classList.remove("disabled");
    } else {
        document.getElementById("register").classList.add("disabled");
    }
}

//
// Password strength validation and UI updates
//

function passwordStrength(password) {
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
    if (strength === "invalid") {
        printErrorMessage("", true);
    }
}

//
// Update Password Strength UI based on the strength level
//

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

// Reset Password UI to default state (INVALID)

function resetPasswordUI() {
    updatePasswordUI("invalid");
}

// Password match validation

function passwordMatch(password, confirmPassword) {
    if (!(password === confirmPassword)) {
        printErrorMessage("Passwords do not match!", true);
        return false;
    } else {
        printErrorMessage("", true);
    }
}

// Print error message in the registration or login form

function printErrorMessage(message, registration) {
    const alertMessage = document.getElementById(registration ? "reg-alert-message" : "login-alert-message");
    
    alertMessage.textContent = message;
}

//
// Switching between registration and login forms
//

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
        resetPasswordUI();

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

// Toggle Password Visibility

function togglePasswordVisibility() {
    
    const isRegContainerActive = document.getElementById("registration-container").classList.contains("active");

    if (isRegContainerActive) {
        toggleRegPassword();
    } else {
        toggleLoginPassword();
    }
}

// Toggle Password Visibility for Registration Form

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

// Toggle Password Visibility for Login Form

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

// Username Validation
document.getElementById("reg-username").addEventListener("input", usernameValidation);

// Toggling password visibility
document.getElementById("reg-toggle-password").addEventListener("click", togglePasswordVisibility);
document.getElementById("login-toggle-password").addEventListener("click", togglePasswordVisibility);

// Password Validation
document.getElementById("reg-password").addEventListener("input", passwordValidation);
document.getElementById("reg-confirm-password").addEventListener("input", passwordValidation);

// Registration Form Submission
document.getElementById("reg-form").addEventListener("submit", function(event) {
    event.preventDefault();
    registerUser();
});