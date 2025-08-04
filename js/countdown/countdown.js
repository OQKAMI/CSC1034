import { backendDeleteExpiredSessions, backendSaveWord, backendCheckWordWithAPI, backendCreateGame, backendUpdateScore, getCurrentUserID, backendUpdateUserStats } from "../backend.js";
import Timer from "./timer.js";

async function expiredSessionCleanup() {
    await backendDeleteExpiredSessions();
    setTimeout(expiredSessionCleanup, 1000 * 60 * 60); // Check every hour
}

// Session cleanup upon loading :::
expiredSessionCleanup();

const timer = new Timer();
const userID = await getCurrentUserID(localStorage.getItem("sessionID"));
if (!userID.success) {
    console.error("Failed to get current user ID:", userID.error);
    window.location.href = "home.html";
    return;
}

const chosenLetters = [];
const submittedWords = [];

const gameElements = {
    messageOverlay: document.querySelector(".message-overlay"),
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

    gameElements.scoreElement.textContent = "0";
    outputMessage("Welcome to Countdown!");

    createSaveGame();
}

function outputMessage(message, type, clearAfter = 0) {
    gameElements.messageElement.textContent = message;

    if (type) {
        gameElements.messageElement.style.color = "var(--" + type + ")";
    } else {
        gameElements.messageElement.style.color = "var(--text-primary)";
    }

    if (clearAfter > 0) {
        setTimeout(() => {
            gameElements.messageElement.textContent = "";
        }, clearAfter);
    }
}

async function createSaveGame() {
    const gameType = localStorage.getItem("gameType");
    if (gameType === "new-game") {

        localStorage.setItem("gameType", "resume-game");

        const difficulty = localStorage.getItem("difficulty");
        const result = await backendCreateGame(userID, difficulty);
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

    if (chosenLetters.length === 9) {
        // Start timer
        timer.start();
        outputMessage("Submit words using the letters.");
    }

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

    if (chosenLetters.length === 9) {
        // Start timer
        timer.start();
        outputMessage("Submit words using the letters.");
    }

    return consonants[randomIndex];
}

// Word Validation Function
function validateWord() {
    const word = gameElements.inputElement.value.trim().toUpperCase();

    if (word.length === 0) return;
    if (submittedWords.includes(word)) {
        outputMessage(`You have already submitted the word "${word}".`, "error", 3000);
        return false;
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

async function CheckWordWithAPI() {
    let valid = validateWord();
    if (!valid) return; 

    const word = gameElements.inputElement.value.trim().toUpperCase();

    let multiplier = localStorage.getItem("scoreMultiplier");
    let score = parseInt(gameElements.scoreElement.textContent) + (word.length * multiplier);

    const result = await backendCheckWordWithAPI(word);
    if (result.valid) {
        gameElements.messageElement.textContent = `Word "${word}" is valid!`;
        gameElements.scoreElement.textContent = score;
        submittedWords.push(word);
        gameElements.inputElement.value = '';

        // Update score in backend
        const gameID = localStorage.getItem("gameID");
        if (gameID) {
            const updateResult = await backendUpdateScore(gameID, score);
            if (!updateResult.success) {
                console.error("Failed to update score:", updateResult.error);
            }
        }

        await backendSaveWord(gameID, word);
    }
}

// Event Handlers

function handleVowelButtonClick() {
    const emptySlot = Object.values(letterElements).find(el => el.textContent === '');
    if (!emptySlot) {
        return;
    }

    const letter = getCryptoRandomVowel();
    emptySlot.textContent = letter;
}

function handleConsonantButtonClick() {
    const emptySlot = Object.values(letterElements).find(el => el.textContent === '');
    if (!emptySlot) {
        return;
    } 

    const letter = getCryptoRandomConsonant();
    emptySlot.textContent = letter;
}

function handleTimerFinish() {
    for (let el of Object.values(letterElements)) {
        el.textContent = '';
    }

    chosenLetters.length = 0;

    if (submittedWords.length > 0) {
        outputMessage(`Time's up! You submitted ${submittedWords.length} words.`, "success", 5000);
        setTimeout(() => {
            outputMessage("Chose a new set of letters to play again.", null, 3000);
        }, 5000);
        set
    } else {
        gameElements.messageOverlay.classList.remove("hidden");
    }
}

async function handleHomeButtonClick() {
    const result = await backendUpdateUserStats(userID, localStorage.getItem("gameID"));
    if (!result.success) {
        console.error("Failed to update user stats:", result.error);
    }
    window.location.href = "home.html";
}

async function handlePlayAgainButtonClick() {
    const result = await backendUpdateUserStats(userID, localStorage.getItem("gameID"));
    if (!result.success) {
        console.error("Failed to update user stats:", result.error);
        window.location.href = "home.html";
        return;
    }

    location.reload();
}

gameElements.vowelButton.addEventListener("click", handleVowelButtonClick);
gameElements.consonantButton.addEventListener("click", handleConsonantButtonClick);
timer.onStateChange((isRunning) => {
    if (!isRunning) {
        handleTimerFinish();
    }
});
gameElements.submitButton.addEventListener("click", () => CheckWordWithAPI());