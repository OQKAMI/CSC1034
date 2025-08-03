import { checkWordWithAPI } from "../database.js";
import Timer from "./timer.js";

const timer = new Timer();

const chosenLetters = [];

const gameElements = {
    scoreElement: document.getElementById("score"),
    difficultyContainer: document.querySelector(".game-difficulty"),
    difficultyElement: document.getElementById("difficulty"),
    vowelButton: document.getElementById("vowel-button"),
    consonantButton: document.getElementById("consonant-button"),
    messageEleement: document.getElementById("message"),
    inputElement: document.getElementById("word-input"),
    submitButton: document.getElementById("submit-word"),
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

function init() {
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

gameElements.vowelButton.addEventListener("click", handleVowelButtonClick);
gameElements.consonantButton.addEventListener("click", handleConsonantButtonClick);