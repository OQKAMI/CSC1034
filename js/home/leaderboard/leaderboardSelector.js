class LeaderboardSelector {
    constructor() {
        this.leaderboardTypes = [
            {
                key: 'scoreHighest',
                name: 'Highest Score',
                description: 'Best single game score',
                icon: '🏆'
            },
            {
                key: 'scoreLifetime',
                name: 'Lifetime Score',
                description: 'Total accumulated points',
                icon: '📊'
            },
            {
                key: 'gamesPlayed',
                name: 'Games Played',
                description: 'Total number of games',
                icon: '🎮'
            },
            {
                key: 'wordsEnteredLifetime',
                name: 'Words Entered',
                description: 'Total words submitted',
                icon: '📝'
            }
        ];
        
        this.currentIndex = 0;
        this.onChangeCallback = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateDisplay();
    }
    
    bindEvents() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigate(-1));
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigate(1));
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.navigate(-1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.navigate(1);
            }
        });
        
        // Touch/swipe support for mobile
        let startX = 0;
        const display = document.getElementById('selectorDisplay');
        
        if (display) {
            display.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            });
            
            display.addEventListener('touchend', (e) => {
                const endX = e.changedTouches[0].clientX;
                const diff = startX - endX;
                
                if (Math.abs(diff) > 50) { // Minimum swipe distance
                    if (diff > 0) {
                        this.navigate(1); // Swipe left = next
                    } else {
                        this.navigate(-1); // Swipe right = previous
                    }
                }
            });
        }
    }
    
    navigate(direction) {
        const newIndex = this.currentIndex + direction;
        
        // Wrap around
        if (newIndex >= this.leaderboardTypes.length) {
            this.currentIndex = 0;
        } else if (newIndex < 0) {
            this.currentIndex = this.leaderboardTypes.length - 1;
        } else {
            this.currentIndex = newIndex;
        }
        
        this.updateDisplay();
        this.triggerChange();
    }
    
    updateDisplay() {
        const currentType = this.leaderboardTypes[this.currentIndex];
        const display = document.getElementById('selectorDisplay');
        const typeElement = document.getElementById('currentType');
        const descriptionElement = document.getElementById('typeDescription');
        
        if (!display || !typeElement || !descriptionElement) {
            console.error('Required DOM elements not found');
            return;
        }
        
        // Add animation class
        display.classList.add('changing');
        
        setTimeout(() => {
            typeElement.textContent = `${currentType.icon} ${currentType.name}`;
            descriptionElement.textContent = currentType.description;
            
            // Remove animation class
            display.classList.remove('changing');
        }, 150);
    }
    
    getCurrentType() {
        return this.leaderboardTypes[this.currentIndex];
    }
    
    setCurrentType(key) {
        const index = this.leaderboardTypes.findIndex(type => type.key === key);
        if (index !== -1) {
            this.currentIndex = index;
            this.updateDisplay();
        }
    }
    
    onChange(callback) {
        this.onChangeCallback = callback;
    }
    
    triggerChange() {
        if (this.onChangeCallback && typeof this.onChangeCallback === 'function') {
            const currentType = this.getCurrentType();
            try {
                this.onChangeCallback(currentType);
            } catch (error) {
                console.error('Error in onChange callback:', error);
            }
        }
    }
}