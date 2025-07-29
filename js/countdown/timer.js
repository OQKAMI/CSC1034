class Timer {
    constructor() {
        this.init();
    }

    init() {
        this.duration = 75; // Default
        this.timeLeft = this.duration;
        this.isRunning = false;
        this.interval = null;

        this.timerDisplay = document.getElementById("timer-display");
        this.timerElement = document.getElementById("timer");

        this.updateDisplay();
    }

    setDuration(seconds) {
        this.duration = seconds;
        this.timeLeft = seconds;
        this.updateDisplay();
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.interval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            this.updateTimer();

            if (this.timeLeft <= 0) {
                this.finish();
            }
        }, 1000)
    }

    updateDisplay() {
        this.timerElement.textContent = this.timeLeft;

        const timeRemaining = this.timeLeft / this.duration; // Percentage of time remaining
        if (timeRemaining < 1) {
            this.timerDisplay.classList.remove("pulsating-warning", "pulsating-error");
            this.timerDisplay.classList.add("pulsating-primary");
        }
        else if (timeRemaining < (2 / 3)) { // 66.67% remaining
            this.timerDisplay.classList.remove("pulsating-primary");
            this.timerDisplay.classList.add("pulsating-warning");
        } else if (timeRemaining < (1 / 3)) { // 33.34% remaining
            this.timerDisplay.classList.remove("pulsating-warning");
            this.timerDisplay.classList.add("pulsating-error");
        }
    }

    updateTimer() {
        
    }

    finish() {

    }
}

export default Timer;