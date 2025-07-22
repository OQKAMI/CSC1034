class HomeUI {
    constructor() {
        this.init();
    }

    init() {
        this.popupContainer = document.getElementById("popup-container");
    }

    showPopup(message, duration = 3000) {
        const fixDuration = duration + 450; // Adjusted for fade-in and fade-out animations
        const popup = document.createElement("div");
        popup.className = "popup";
        popup.textContent = message;

        this.popupContainer.appendChild(popup);
        popup.classList.add("fade-in");

        setTimeout(() => {
            popup.classList.remove("fade-in");
        }, 450);

        setTimeout(() => {
            popup.classList.add("fade-out");
        }, fixDuration);
        popup.addEventListener("animationend", () => {
            this.popupContainer.removeChild(popup);
        });
    }
}

export default HomeUI;