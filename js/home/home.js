import { backendDeleteExpiredSessions, backendCheckExistingGame } from "../database.js";
import HomeUI from "./homeUI.js";

const homeUI = new HomeUI();

async function expiredSessionCleanup() {
    await backendDeleteExpiredSessions();
    setTimeout(expiredSessionCleanup, 1000 * 60 * 60); // Check ever.y hour
}

// Session cleanup upon loading :::
await expiredSessionCleanup();

// Check for existing game save :::
await checkForGameSave();

async function checkForGameSave() {
    const result = await backendCheckExistingGame();
    console.log("Check for existing game result:", result);
    if (result && result.hasGameSave) {
        if (result.gameData) {
            localStorage.setItem("gameID", result.gameData.gameID);
            document.querySelector(".resume-game-container").classList.remove("hidden");
            document.getElementById("resume-difficulty").textContent = result.gameData.difficulty.charAt(0).toUpperCase() + result.gameData.difficulty.slice(1);
            document.getElementById("resume-last-played").textContent = result.gameData.lastPlayed.toLocaleString();
            difficultyToLS(result.gameData.difficulty);
        } else {
            document.querySelector(".resume-game-container").classList.add("hidden");
        }
    }
}

function logoutUser() {
    localStorage.removeItem("sessionID");
    localStorage.removeItem("difficulty");
    localStorage.removeItem("scoreMultiplier")
    location.reload();
}

function difficultyToLS(difficulty) {
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

function resumeGame() {
    localStorage.setItem("gameType", "resume-game");
    window.location.href = "countdown.html";
}

function startNewGame() {
    if (document.getElementById("difficulty").value === "") {
        homeUI.showPopup("Please select a difficulty before starting a new game.", 3000);
        return;
    }

    difficultyToLS(document.getElementById("difficulty").value);
    localStorage.setItem("gameType", "new-game");
    window.location.href = "countdown.html";
}

// Event Handlers

document.getElementById("logout").addEventListener("click", logoutUser);
document.getElementById("new-game").addEventListener("click", startNewGame);
document.getElementById("resume-game").addEventListener("click", resumeGame);