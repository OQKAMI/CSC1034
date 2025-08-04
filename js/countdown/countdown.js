import { backendDeleteExpiredSessions, backendCheckWordWithAPI, backendCreateGame, backendUpdateScore, getCurrentUserID } from "../database.js";
import Timer from "./timer.js";

async function expiredSessionCleanup() {
    await backendDeleteExpiredSessions();
    setTimeout(expiredSessionCleanup, 1000 * 60 * 60); // Check every hour
}

// Session cleanup upon loading :::
expiredSessionCleanup();

const timer = new Timer();

const chosenLetters = [];

const gameElements = {
    scoreElement: document.getElementById("score"),
    difficultyContainer: document.querySelector(".game-difficulty"),
    difficultyElement: document.getElementById("difficulty"),
    vowelButton: document.getElementById("vowel-button"),
    consonantButton: document.getElementById("consonant-button"),
    messageElement: document.getElementById("message"),
    inputElement: document.getElementById("word-input"),
    submitButton: document.getElementById("submit-word"),
    playAgainButton: document.getElementById("play-again"),
    homeButton: document.getElementById("home"),
}

const letterElements = {
    letterOne: document.getElementById('letter-1'),
    letterTwo: document.getElementById('letter-2'),
    letterThree: document.getElementById('letter-3'),
    letterFour: document.getElementById('letter-4'),
    letterFive: document.getElementById('letter-5'),
    letterSix: document.getElementById('letter-6'),
    letterSeven: document.getElementById('letter-7'),
    letterEight: document.getElementById('letter-8'),
    letterNine: document.getElementById('letter-9'),
};

init();

async function init() {
    switch (localStorage.getItem("difficulty")) {
        case "easy":
            timer.setDuration(90);
            gameElements.difficultyElement.textContent = "Easy";
            gameElements.difficultyContainer.classList.add("easy");
            break;
        case "medium":
            timer.setDuration(75);
            gameElements.difficultyElement.textContent = "Medium";
            gameElements.difficultyContainer.classList.add("medium");
            break;
        case "hard":
            timer.setDuration(60);
            gameElements.difficultyElement.textContent = "Hard";
            gameElements.difficultyContainer.classList.add("hard");
            break;
    }

    createSaveGame();
}

async function createSaveGame() {
    const gameType = localStorage.getItem("gameType");
    if (gameType === "new-game") {

        localStorage.setItem("gameType", "resume-game");

        const userID = await getCurrentUserID(localStorage.getItem("sessionID"));
        if (!userID.success) {
            console.error("Failed to get current user ID:", userID.error);
            return;
        }

        const difficulty = localStorage.getItem("difficulty");
        const result = await backendCreateGame(userID.userID, difficulty);
        if (result.success) {
            localStorage.setItem("gameID", result.gameID);
        } else {
            console.error("Failed to create game:", result.error);
        }
    }
}

// Vowel Function
function getCryptoRandomVowel() {
    const vowels = ['A', 'E', 'I', 'O', 'U'];

    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const randomIndex = array[0] % vowels.length;

    chosenLetters.push(vowels[randomIndex]); // Saving mechanism for chosen letters

    return vowels[randomIndex];
}

// Consonant Function
function getCryptoRandomConsonant() {
    const consonants = [
        'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 
        'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'
    ];
    
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const randomIndex = array[0] % consonants.length;

    chosenLetters.push(consonants[randomIndex]); // Saving mechanism for chosen letters

    return consonants[randomIndex];
}

// Word Validation Function
function validateWord() {
    const word = gameElements.inputElement.value.trim().toUpperCase();

    if (word.length === 0) {
        return;
    }

    const difficulty = localStorage.getItem("difficulty");
    let maxAllowed;

    if (difficulty === "easy") maxAllowed = Infinity;
    else if (difficulty === "medium") maxAllowed = 3;
    else if (difficulty === "hard") maxAllowed = 1;  

    const wordLetterCounts = {};
    for (let letter of word) {
        if (!chosenLetters.includes(letter)) return false;
        wordLetterCounts[letter] = (wordLetterCounts[letter] || 0) + 1;
    }

    for (let letter in wordLetterCounts) {
        if (wordLetterCounts[letter] > maxAllowed) return false;
    }

    return true;
}

async function CheckWordWithAPI(word) {
    let valid = validateWord();
    if (!valid) return false;

    let multiplier = localStorage.getItem("scoreMultiplier");
    let score = parseInt(gameElements.scoreElement.textContent) + (word.length * multiplier);

    return await backendCheckWordWithAPI(word).then(result => {
        if (result.success) {
            gameElements.messageElement.textContent = "Valid word!";
            gameElements.scoreElement.textContent = score.toString(); 
            gameElements.inputElement.value = "";
        } else {
            gameElements.messageElement.textContent = "Invalid word. Try again.";
        }
    }).catch(err => {
        console.error("Error checking word:", err);
        gameElements.messageElement.textContent = "Error checking word. Please try again.";
    });
}

// Event Handlers

function handleVowelButtonClick() {
    const emptySlot = Object.values(letterElements).find(el => el.textContent === ''); // Find the first empty letter slot
    if (!emptySlot) {
        return; // No empty slot available
    }

    const letter = getCryptoRandomVowel();
    emptySlot.textContent = letter;
}

function handleConsonantButtonClick() {
    const emptySlot = Object.values(letterElements).find(el => el.textContent === ''); // Find the first empty letter slot
    if (!emptySlot) {
        return; // No empty slot available'
    } 

    const letter = getCryptoRandomConsonant();
    emptySlot.textContent = letter;
}

function handleHomeButtonClick() {
    // TODO: Now migrate temp game data from Games to UserStats !!!!!!!
    window.location.href = "home.html";
}

function handlePlayAgainButtonClick() {
    // TODO: Now migrate temp game data from Games to UserStats !!!!!!!
    location.reload();
}

gameElements.vowelButton.addEventListener("click", handleVowelButtonClick);
gameElements.consonantButton.addEventListener("click", handleConsonantButtonClick);
timer.onStateChange((isRunning) => {
    if (!isRunning) {
        for (let el of Object.values(letterElements)) {
            el.textContent = ''; // Clear all letter slots
        }


    }
});
gameElements.submitButton.addEventListener("click", CheckWordWithAPI);