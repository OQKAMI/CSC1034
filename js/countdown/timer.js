class Timer {
    constructor() {
        this.init();
    }

    init() {
        this.listeners = [];

        this.duration = 75; // Default
        this.timeLeft = this.duration;
        this.isRunning = false;
        this.interval = null;

        this.timerDisplay = document.getElementById("timer-display");
        this.timerElement = document.getElementById("timer");

        this.updateDisplay();
    }

    onStateChange(listener) {
        this.listeners.push(listener);
    }

    setDuration(seconds) {
        this.duration = seconds;
        this.timeLeft = seconds;
        this.updateDisplay();
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.emitStateChange();
        this.interval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();

            if (this.timeLeft <= 0) {
                this.finish();
            }
        }, 1000);
    }

    updateDisplay() {
        this.timerElement.textContent = this.timeLeft;

        const timeRemaining = this.timeLeft / this.duration; // Percentage of time remaining
        if (timeRemaining < (1 / 3)) { // 33.34% remaining
            this.timerDisplay.classList.remove("pulsating-warning");
            this.timerDisplay.classList.add("pulsating-error");
        } else if (timeRemaining < (2 / 3)) { // 66.67% remaining
            this.timerDisplay.classList.remove("pulsating-primary");
            this.timerDisplay.classList.add("pulsating-warning");
        } else if (timeRemaining < 1) {
            this.timerDisplay.classList.remove("pulsating-warning", "pulsating-error");
            this.timerDisplay.classList.add("pulsating-primary");
        }
        
    }

    emitStateChange() {
        this.listeners.forEach(listener => listener(this.isRunning));
    }

    reset() {
        this.isRunning = false;
        clearInterval(this.interval);
        this.timeLeft = this.duration;
        this.timerDisplay.classList.remove("pulsating-error"); // Other classes are automatically removed :::
    }

    finish() {
        this.reset();
        this.emitStateChange();
    }
}

export default Timer;