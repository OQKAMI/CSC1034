import { resetPasswordUI } from "./validation.js";

// TODO: DOCUMENT THIS
class FormUI {
    constructor() {
        this.init();
    }

    // TODO: DOCUMENT THIS
    init() {
        this.regContainer = document.getElementById("registration-container");
        this.loginContainer = document.getElementById("login-container");

        this.regForm = document.getElementById("reg-form");
        this.loginForm = document.getElementById("login-form");

        this.regPasswordInput = document.getElementById("reg-password");
        this.regConfirmPasswordInput = document.getElementById("reg-confirm-password");
        this.loginPasswordInput = document.getElementById("login-password");
    }

    // TODO: DOCUMENT THIS
    resetForms() {
        this.regForm.reset();
        this.loginForm.reset();
        resetPasswordUI();
    }

    // TODO: DOCUMENT THIS
    togglePasswordVisibility() {
        
        const RegContainerActive = this.isRegContainerActive();
        console.log("RegContainerActive:", RegContainerActive);
        if (RegContainerActive) {
            this.toggleRegPassword();
        } else {
            this.toggleLoginPassword();
        }
    }

    // TODO: DOCUMENT THIS
    toggleRegPassword() {
        const eyeIcon = document.getElementById("reg-eye-icon");

        eyeIcon.classList.add("changing");

        setTimeout(() => {
            if (eyeIcon.classList.contains("fa-eye")) { // If the eye icon is currently showing an open eye :::
                eyeIcon.classList.remove("fa-eye");
                eyeIcon.classList.add("fa-eye-slash");

                this.regPasswordInput.type = "text";
                this.regConfirmPasswordInput.type = "text";
            } else { // If the eye icon is currently showing a closed eye :::
                eyeIcon.classList.remove("fa-eye-slash");
                eyeIcon.classList.add("fa-eye");

                this.regPasswordInput.type = "password";
                this.regConfirmPasswordInput.type = "password";
            }

            eyeIcon.classList.remove("changing");
        }, 100);
    }

    // TODO: DOCUMENT THIS
    toggleLoginPassword() { 
        const eyeIcon = document.getElementById("login-eye-icon");

        eyeIcon.classList.add("changing");

        setTimeout(() => {
            if (eyeIcon.classList.contains("fa-eye")) { // If the eye icon is currently showing an open eye :::
                eyeIcon.classList.remove("fa-eye");
                eyeIcon.classList.add("fa-eye-slash");
                
                this.loginPasswordInput.type = "text";
            } else { // If the eye icon is currently showing a closed eye :::
                eyeIcon.classList.remove("fa-eye-slash");
                eyeIcon.classList.add("fa-eye");

                this.loginPasswordInput.type = "password";
            }

            eyeIcon.classList.remove("changing");
        }, 100);
    }

    // TODO: DOCUMENT THIS
    switchForm() {
        if (!this.regContainer || !this.loginContainer) {
            console.error("One or both containers not found!");
            return;
        }

        const regOrder = window.getComputedStyle(this.regContainer).order;
        let regFocused = regOrder === "0";

        if (regFocused) {

            if (this.regContainer.classList.contains("active")) {
                this.regContainer.classList.remove("active");
            }

            this.regContainer.style.order = "1";
            this.regContainer.style.opacity = "0";
            this.regContainer.classList.add("inactive");
            
            if (this.loginContainer.classList.contains("inactive")) {
                this.loginContainer.classList.remove("inactive");
            }

            this.loginContainer.style.order = "0";
            this.loginContainer.style.opacity = "1";
            this.loginContainer.classList.add("active");

            this.regForm.reset();
            resetPasswordUI();

        } else {
            
            if (this.loginContainer.classList.contains("active")) {
                this.loginContainer.classList.remove("active");
            }

            this.loginContainer.style.order = "1";
            this.loginContainer.style.opacity = "0";
            this.loginContainer.classList.add("inactive");

            if (this.regContainer.classList.contains("inactive")) {
                this.regContainer.classList.remove("inactive");
            }

            this.regContainer.style.order = "0";
            this.regContainer.style.opacity = "1";
            this.regContainer.classList.add("active");

            this.loginForm.reset();
        }
    }

    // TODO: DOCUMENT THIS
    isRegContainerActive() {
        return this.regContainer.classList.contains("active");
    }
}

export default FormUI;