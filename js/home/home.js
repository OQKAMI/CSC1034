import HomeUI from "./homeUI.js";

const homeUI = new HomeUI();

function logoutUser() {
    localStorage.removeItem("sessionID");
    localStorage.removeItem("difficulty");
    localStorage.removeItem("scoreMultiplier")
    location.reload();
}

function difficultyToLS() {
    const difficulty = document.getElementById("difficulty").value;
    localStorage.setItem("difficulty", difficulty);

    switch (difficulty) {
        case "easy":
            localStorage.setItem("scoreMultiplier", 0.90);
            break;
        case "medium":
            localStorage.setItem("scoreMultiplier", 1.00);
            break;
        case "hard":
            localStorage.setItem("scoreMultiplier", 1.50);
            break;
    }
}

function startNewGame() {
    if (!localStorage.getItem("difficulty")) {
        homeUI.showPopup("Please select a difficulty before starting a new game.", 3000);
        return;
    }

    window.location.href = "countdown.html";
}

// Event Handlers

document.getElementById("logout").addEventListener("click", logoutUser);
document.getElementById("difficulty").addEventListener("change", difficultyToLS);
document.getElementById("new-game").addEventListener("click", startNewGame);