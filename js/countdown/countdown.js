import { backendDeleteExpiredSessions, backendSaveWord, backendCheckWordWithAPI, backendCreateGame, backendUpdateScore, backendFetchGameScore, getCurrentUserID, backendUpdateUserStats } from "../backend.js";
import Timer from "./timer.js";

async function expiredSessionCleanup() {
    await backendDeleteExpiredSessions();
    setTimeout(expiredSessionCleanup, 1000 * 60 * 60); // Check every hour
}

// Session cleanup upon loading :::
expiredSessionCleanup();

const timer = new Timer();
let userIDResult = await getCurrentUserID(localStorage.getItem("sessionID"));
if (!userIDResult.success) {
    console.error("Failed to get current user ID:", userID.error);
    window.location.href = "home.html";
}

const userID = userIDResult.userID;

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

    if (localStorage.getItem("chosenLetters")) {
        loadGameState();
    }

    gameElements.scoreElement.textContent = "0";
    outputMessage("Welcome to Countdown!");

    await createSaveGame();

    if (localStorage.getItem("gameType") === "resume-game") {
        outputMessage("Resuming your game...", "success", 2000);
            setTimeout(() => {
                outputMessage("Choose a new set of letters to continue playing.", null, 0);
            }, 2000);
    }
}

function loadGameState() {
    const savedLetters = localStorage.getItem("chosenLetters");
    const savedWords = localStorage.getItem("submittedWords");
    const savedTimeLeft = localStorage.getItem("timeLeft");
    
    if (savedLetters) {
        const letters = JSON.parse(savedLetters);
        const letterKeys = Object.keys(letterElements);
        
        // Clear existing letters first
        chosenLetters.length = 0;
        
        // Load saved letters
        letters.forEach((letter, index) => {
            if (index < letterKeys.length && letterElements[letterKeys[index]]) {
                letterElements[letterKeys[index]].textContent = letter;
                chosenLetters.push(letter);
            }
        });
    }
    
    if (savedWords) {
        submittedWords.length = 0; // Clear existing
        submittedWords.push(...JSON.parse(savedWords));
    }
    
    if (savedTimeLeft) {
        timer.timeLeft = parseInt(savedTimeLeft);
    } else {
        timer.timeLeft = timer.duration;
    }
    
    timer.updateDisplay();
    timer.start();

    localStorage.removeItem("chosenLetters");
    localStorage.removeItem("submittedWords");
    localStorage.removeItem("timeLeft");
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
            gameElements.messageElement.style.color = "var(--text-primary)";
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

    if (word.length === 0) return false;

    const difficulty = localStorage.getItem("difficulty");
    let maxAllowed;

    if (difficulty === "easy") maxAllowed = Infinity;
    else if (difficulty === "medium") maxAllowed = 3;
    else if (difficulty === "hard") maxAllowed = 1;

    // Count how many of each letter the user chose
    const chosenLetterCounts = {};
    for (let letter of chosenLetters) {
        chosenLetterCounts[letter] = (chosenLetterCounts[letter] || 0) + 1;
    }

    // Count how many of each letter the word uses
    const wordLetterCounts = {};
    for (let letter of word) {
        if (!chosenLetters.includes(letter)) {
            outputMessage(`Word contains letter "${letter}" which was not chosen.`, "error", 3000);
            return false;
        }
        wordLetterCounts[letter] = (wordLetterCounts[letter] || 0) + 1;
    }

    // Check if word uses more of any letter than available
    for (let letter in wordLetterCounts) {
        const availableCount = Math.max(chosenLetterCounts[letter], maxAllowed);
        if (wordLetterCounts[letter] > availableCount) {
            outputMessage(`Word uses ${wordLetterCounts[letter]} "${letter}"s but only ${availableCount} available.`, "error", 3000);
            return false;
        }
    }

    return true;
}

async function CheckWordWithAPI() {
    let valid = validateWord();
    if (!valid) {
        outputMessage("Invalid letter usage.", "error", 3000);
        gameElements.inputElement.value = '';
        return;
    }
    const word = gameElements.inputElement.value.trim().toUpperCase();

    if (submittedWords.includes(word)) {
        outputMessage(`You have already submitted the word "${word}".`, "error", 3000);
        gameElements.inputElement.value = '';
        return;
    }

    let multiplier = localStorage.getItem("scoreMultiplier");
    let score = parseInt(gameElements.scoreElement.textContent) + (word.length * multiplier);

    const result = await backendCheckWordWithAPI(word);
    if (result.valid) {
        gameElements.messageElement.textContent = `Word "${word}" is valid!`;
        gameElements.scoreElement.textContent = score;
        submittedWords.push(word);
        gameElements.inputElement.value = '';

        const gameID = localStorage.getItem("gameID");
        if (gameID) {
            const updateResult = await backendUpdateScore(gameID, score);
            if (!updateResult.success) {
                console.error("Failed to update score:", updateResult.error);
            }
        }

        const result = await backendSaveWord(gameID, word);
        console.log("Word saved:", result);
    } else {
        outputMessage(`Word "${word}" is invalid!`, "error", 3000);
        gameElements.inputElement.value = '';
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
        submittedWords.length = 0;
        setTimeout(() => {
            outputMessage("Chose a new set of letters to play again.", null, 0);
        }, 5000);
    } else {
        gameElements.messageOverlay.classList.remove("hidden");
        gameElements.messageOverlay.classList.remove("pointer-override");
    }
}

async function handleHomeButtonClick() {
    const result = await backendUpdateUserStats(userID, localStorage.getItem("gameID"));
    window.location.href = "home.html";
}

async function handlePlayAgainButtonClick() {
    const result = await backendUpdateUserStats(userID, localStorage.getItem("gameID"));
    location.reload();
    localStorage.setItem("gameType", "new-game");
    let gameID = parseInt(localStorage.getItem("gameID"));
    let newGameID = gameID + 1;
    localStorage.setItem("gameID", newGameID);
    init();
}

gameElements.vowelButton.addEventListener("click", handleVowelButtonClick);
gameElements.consonantButton.addEventListener("click", handleConsonantButtonClick);
timer.onStateChange((isRunning) => {
    if (!isRunning) {
        handleTimerFinish();
    }
});
gameElements.inputElement.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        CheckWordWithAPI();
    }
})
gameElements.submitButton.addEventListener("click", () => CheckWordWithAPI());
gameElements.homeButton.addEventListener("click", handleHomeButtonClick);

gameElements.playAgainButton.addEventListener("click", handlePlayAgainButtonClick);
document.getElementById("back-home-button").addEventListener("click", () => { 
    if (timer.isRunning) {
        localStorage.setItem("chosenLetters", JSON.stringify(chosenLetters));
        localStorage.setItem("submittedWords", JSON.stringify(submittedWords));
        localStorage.setItem("timeLeft", timer.timeLeft);
    }

    window.location.href = "home.html";
 });

window.addEventListener("beforeunload", () => {
    if (timer.isRunning) {
        localStorage.setItem("chosenLetters", JSON.stringify(chosenLetters));
        localStorage.setItem("submittedWords", JSON.stringify(submittedWords));
        localStorage.setItem("timeLeft", timer.timeLeft);
    }
})