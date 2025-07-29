import { checkWordWithAPI } from "../database.js";
import Timer from "./timer.js";

const timer = new Timer();

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

