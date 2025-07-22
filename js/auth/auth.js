import { backendUserRegistration, backendUserLogin, getCurrentUserID, checkSession, backendUsernameAvailability, backendDeleteExpiredSessions } from "../database.js";
import RegValidator from "./validation.js";
import { updateConfirmPasswordLength, updatePasswordUI, resetPasswordUI } from "./validation.js";
import FormUI from "./formUI.js";

const formUI = new FormUI();
const regValidator = new RegValidator();

const elements = {
    authOverlay: document.getElementById("authentication-overlay"),
    registerButton: document.getElementById("register"),
    regErrorDisplay: document.getElementById("reg-alert-message"),
    loginButton: document.getElementById("login"),
    loginErrorDisplay: document.getElementById("login-alert-message")
};

autoSessionCheck();

// TODO: DOCUMENT THIS
async function autoSessionCheck() {
    const sessionID = getSessionID();
    if (!sessionID) {
        backendDeleteExpiredSessions();
        showAuthenticationForms();
        return;
    }

    const isValidSession = await checkSession(sessionID);
    if (isValidSession) {
        const userID = await getCurrentUserID(getSessionID());
        if (userID) {
            hideAuthenticationForms();
            return;
        }
    }

    clearSessionID();
    showAuthenticationForms();
}

//
// Registration Functions
//

// TODO: DOCUMENT THIS
async function registerUser() {
    const userID = crypto.randomUUID();
    const username = document.getElementById("reg-username").value.trim();
    const password = document.getElementById("reg-password").value;

    const isAvailable = await backendUsernameAvailability(username);
    if (!isAvailable) {
        formUI.resetForms();
        printError("Username unavailable");
        setTimeout(() => {
            clearError();
        }, 3000)
        return;
    }

    const hashedPassword = await hashPassword(password);
    if (!hashedPassword) {
        printError("Error hashing password... Please try again");
        setTimeout(() => {
            clearError();
        }, 3000);
        return;
    }

    const result = await backendUserRegistration(userID, username, hashedPassword);
    if (result.error) {
        printError("Error registering user... Please try again");
        setTimeout(() => {
            clearError();
        }, 3000);
        console.error("Registration error:", result.error);
        return;
    }

    formUI.resetForms();
    clearError();

    saveSessionID(result.sessionID);

    hideAuthenticationForms();
}

// TODO: DOCUMENT THIS
async function validateUsername() {
    const result = await regValidator.isUsernameValid();

    if (!result.isValid) {
        printError(result.error);
    } else {
        clearError();
    }
}

// TODO: DOCUMENT THIS
function validatePassword() {
    const result = regValidator.isPasswordValid();

    if (result.isValid) {
        updatePasswordUI(result.strength);
        updateConfirmPasswordLength(result.passwordLength);
        clearError();
    } else {
        resetPasswordUI();
        updateConfirmPasswordLength(result.passwordLength);
        printError(result.error);
        return;
    }

    if (regValidator.passwordMismatch()) {
        disableRegisterButton();
        return;
    } else {
        enableRegisterButton();
    }
}

// TODO: DOCUMENT THIS
async function hashPassword(password) {
    try {
        const salt = new Uint8Array(16);
        crypto.getRandomValues(salt);

        const hash = await argon2.hash({
            pass: password,
            type: argon2.ArgonType.Argon2id,
            time: 2,
            salt: salt,
            mem: 32 * 1024, // 64 MB
            parallelism: 4, // 4 threads
            hashLen: 32, // 32 bytes
        });
        return hash.encoded;
    } catch (err) {
        console.error("Error hashing password:", err);
        return null;
    }
}

// TODO: DOCUMENT THIS
function disableRegisterButton() {
    elements.registerButton.disabled = true;
    elements.registerButton.classList.add("disabled");
}

// TODO: DOCUMENT THIS
function enableRegisterButton() {
    elements.registerButton.disabled = false;
    elements.registerButton.classList.remove("disabled");
}

//
// Login Functions
//

// TODO: DOCUMENT THIS
async function loginUser() {
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;

    const result = await backendUserLogin(username, password);
    if (result.error) {
        formUI.resetForms();
        printError(result.error);
        setTimeout(() => {
            clearError();
        }, 3000);
        return;
    }

    formUI.resetForms();
    clearError();

    saveSessionID(result.sessionID);

    hideAuthenticationForms();
}

//
// LocalStorage Functions
//

// TODO: DOCUMENT THIS
function saveSessionID(sessionID) {
    localStorage.setItem("sessionID", sessionID);
}

// TODO: DOCUMENT THIS
function getSessionID() {
    return localStorage.getItem("sessionID");
}

// TODO: DOCUMENT THIS
function clearSessionID() {
    localStorage.removeItem("sessionID");
}

//
// Error Output Functions
//

// TODO: DOCUMENT THIS
function printError(error) {
    const RegContainerActive = formUI.isRegContainerActive();

    if (RegContainerActive) {
        elements.regErrorDisplay.textContent = error;
        elements.regErrorDisplay.style.color = "var(--error)";
    } else {
        elements.loginErrorDisplay.textContent = error;
        elements.loginErrorDisplay.style.color = "var(--error)";
    }
}

// TODO: DOCUMENT THIS
function clearError() {
    const RegContainerActive = formUI.isRegContainerActive();

    if (RegContainerActive) {
        elements.regErrorDisplay.textContent = "";
        elements.regErrorDisplay.style.color = "var(--text-secondary)";
    } else {
        elements.loginErrorDisplay.textContent = "";
        elements.loginErrorDisplay.style.color = "var(--text-secondary)";
    }
}

// TODO: DOCUMENT THIS
function hideAuthenticationForms() {
    elements.authOverlay.classList.add("hidden");
}

// TODO: DOCUMENT THIS
function showAuthenticationForms() {
    elements.authOverlay.classList.remove("hidden");
}

document.getElementById("reg-username").addEventListener("input", validateUsername);
document.getElementById("reg-password").addEventListener("input", validatePassword);
document.getElementById("reg-confirm-password").addEventListener("input", validatePassword);

document.getElementById("reg-toggle-password").addEventListener("click", () => { formUI.togglePasswordVisibility();} );
document.getElementById("login-toggle-password").addEventListener("click", () => { formUI.togglePasswordVisibility(); } );

document.getElementById("reg-switch").addEventListener("click", () => { formUI.switchForm(); });
document.getElementById("login-switch").addEventListener("click", () => { formUI.switchForm(); });

document.getElementById("reg-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    await registerUser();
});

document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    await loginUser();
});
