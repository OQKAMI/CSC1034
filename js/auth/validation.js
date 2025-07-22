/**
 * Validates registration form inputs.
 * @class
 * @description Handles username and password validation for registration
 */
class RegValidator {
    /**
     * Creates an instance of RegValidator
     * @constructor
     * @description Initializes DOM element references for form validation
     */
    constructor() {
        this.regUsername = document.getElementById("reg-username");
        this.regPassword = document.getElementById("reg-password");
        this.regConfirmPassword = document.getElementById("reg-confirm-password");
    }

    /**
     * Validates username
     * @async
     * @function
     * @returns {Promise<Object>} Validation result object
     * @returns {boolean} returns.isValid - Indicates username validity
     * @returns {string|null} returns.error - Error type if invalid, null if valid
     */
    async isUsernameValid() {
        let username = this.regUsername.value.trim();

        if (username.length === 0) {
            return { isValid: false, error: "" };
        } 
        else if (username.length < 4) {
            return { isValid: false, error: "Username must be at least 4 characters long" };
        } 
        else if (username.length > 16) {
            return { isValid: false, error: "Username must be 16 characters at most" };
        } 
        else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return { isValid: false, error: "Invalid symbols used in username" };
        }

        return { isValid: true, error: null };        
    }

    /**
     * Validates password strength and confirmation match
     * @function
     * @returns {Object} Password validation result
     * @returns {boolean} returns.isValid - Indicates password validity
     * @returns {string|null} returns.error - Error type ("empty", "short") if invalid, null if valid
     * @returns {string} returns.strength - Password strength ("strong", "medium", "weak", "invalid")
     * @returns {number} returns.passwordLength - Length of the password for outside logic
     */
    isPasswordValid() {
        let password = this.regPassword.value;

        if (password.length === 0) {
            return { isValid: false, error: "", passwordLength: 0 };
        }
        else if (password.length < 8) {
            return { isValid: false, error: "Password must be at least 8 characters long", passwordLength: password.length };
        }

        return {
            isValid: true,
            error: null,
            strength: this.getPasswordStrength(password),
            passwordLength: password.length
        };
    }

    /**
     * Checks if the password and confirmation match
     * @function
     * @returns {boolean} true if passwords match, false otherwise
     */
    passwordMismatch() {
        let password = this.regPassword.value;
        let confirmPassword = this.regConfirmPassword.value;

        return password !== confirmPassword;
    }

    // TODO: DOCUMENT THIS
    getPasswordStrength(password) {
        const checks = {
            hasLetters: /[a-zA-Z]/.test(password),
            hasNumbers: /[0-9]/.test(password),
            hasSymbols: /[^a-zA-Z0-9]/.test(password)
        };

        const checksPassed = Object.values(checks).filter(Boolean).length;

        const strengthLevels = {
            3: "strong",
            2: "medium",
            1: "weak",
            0: "invalid"
        };

        return strengthLevels[checksPassed];
    }
}

// TODO: DOCUMENT THIS
class PasswordUI {
    constructor() {
        this.elements = {
            label: document.getElementById("password-strength-label"),
            container: document.getElementById("password-strength"),
            indicators: [
                document.getElementById("weak-password-indicator"),
                document.getElementById("medium-password-indicator"),
                document.getElementById("strong-password-indicator")
            ]
        };

        this.regPasswordInput = document.getElementById("reg-password");
        this.regConfirmPasswordInput = document.getElementById("reg-confirm-password");
        this.loginPasswordInput = document.getElementById("login-password");

        this.config = {
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
    }

    // TODO: DOCUMENT THIS
    update(strength) {
        const settings = this.config[strength];
        const containerColor = settings.containerColor || settings.color;

        this.updateLabel(settings.text, settings.color);
        this.updateContainer(containerColor);
        this.updateIndicators(strength, settings.activeIndicators);
    }

    // TODO: DOCUMENT THIS
    updateLabel(text, color) {
        this.elements.label.textContent = text;
        this.elements.label.style.color = color;
    }

    // TODO: DOCUMENT THIS
    updateContainer(color) {
        this.elements.container.style.borderColor = color;
        this.elements.container.style.boxShadow = `0 0 5px ${color}, inset 0 0 5px ${color}`;
    }

    // TODO: DOCUMENT THIS
    updateIndicators(strength, activeIndicators) {
        this.elements.indicators.forEach((indicators, index) => {
            if (index < activeIndicators) {
                indicators.style.backgroundColor = "var(--success)";
                indicators.style.boxShadow = "0 0 7px var(--success)";
            } else {
                const isInvalid = strength === "invalid";
                indicators.style.backgroundColor = isInvalid ? "var(--error)" : "";
                indicators.style.boxShadow = isInvalid ? "0 0 7px var(--error)" : "";
            }
        })
    }

    // TODO: DOCUMENT THIS
    reset() {
        this.update("invalid");
    }

    // TODO: DOCUMENT THIS
    updateConfirmPasswordLength(length) {
        this.regConfirmPasswordInput.setAttribute("minlength", length);
    }
}

const passwordUI = new PasswordUI();

// TODO: DOCUMENT THIS
export function updateConfirmPasswordLength(length) {
    passwordUI.updateConfirmPasswordLength(length);
}

// TODO: DOCUMENT THIS
export function updatePasswordUI(strength) {
    passwordUI.update(strength);
}

// TODO: DOCUMENT THIS
export function resetPasswordUI() {
    passwordUI.reset();
}

// TODO: DOCUMENT THIS
export function togglePasswordVisibility() {
    passwordUI.togglePasswordVisibility();
}

export default RegValidator;