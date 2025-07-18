import { isUsernameAvailable, insertUser } from "./database.js";
import RegValidator from "./home/validation.js";
import { updateConfirmPasswordLength, updatePasswordUI, resetPasswordUI } from "./home/validation.js";
import FormUI from "./home/formUI.js";

const formUI = new FormUI();
const regValidator = new RegValidator();

const elements = {
    registerButton: document.getElementById("register"),
    regErrorDisplay: document.getElementById("reg-alert-message"),
    loginErrorDisplay: document.getElementById("login-alert-message"),
};

async function registerUser() {
    const userID = crypto.randomUUID();
    const username = document.getElementById("reg-username").value.trim();
    const password = document.getElementById("reg-password").value;

    const isAvailable = await isUsernameAvailable(username);
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
        printError("Error hashing password. Please try again.");
        setTimeout(() => {
            clearError();
        }, 3000);
        return;
    }

    const insertResult = await insertUser(userID, username, hashedPassword);
    if (insertResult.error) {
        printError("Error registering user. Please try again.");
        setTimeout(() => {
            clearError();
        }, 3000);
        return;
    }

    formUI.resetForms();
    clearError();
}

async function validateUsername() {
    const result = await regValidator.isUsernameValid();
    console.log("Username validation result:", result);

    if (!result.isValid) {
        printError(result.error);
    } else {
        clearError();
    }
}

function validatePassword() {
    const result = regValidator.isPasswordValid();
    console.log("Password validation result:", result);

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

async function hashPassword(password) {
    try {
        const salt = new Uint8Array(16);
        crypto.getRandomValues(salt);

        const hash = await argon2.hash({
            pass: password,
            type: argon2.ArgonType.Argon2id,
            time: 3,
            salt: salt,
            mem: 64 * 1024, // 64 MB
            parallelism: 1,
            hashLen: 32, // 32 bytes
        });
        return hash.encoded;
    } catch (err) {
        console.error("Error hashing password:", err);
        return null;
    }
}

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

function disableRegisterButton() {
    elements.registerButton.disabled = true;
    elements.registerButton.classList.add("disabled");
}

function enableRegisterButton() {
    elements.registerButton.disabled = false;
    elements.registerButton.classList.remove("disabled");
}

document.getElementById("reg-username").addEventListener("input", validateUsername);
document.getElementById("reg-password").addEventListener("input", validatePassword);
document.getElementById("reg-confirm-password").addEventListener("input", validatePassword);

document.getElementById("reg-toggle-password").addEventListener("click", () => { formUI.togglePasswordVisibility();} );
document.getElementById("login-toggle-password").addEventListener("click", () => { formUI.togglePasswordVisibility(); } );

document.getElementById("reg-switch").addEventListener("click", formUI.switchForm);
document.getElementById("login-switch").addEventListener("click", formUI.switchForm);

document.getElementById("reg-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    await registerUser();
});
