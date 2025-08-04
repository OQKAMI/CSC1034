class Leaderboard {
    constructor() {
        this.currentType = 'scoreHighest';
        this.currentUser = 'OokamiGamma';
        this.data = [];
        this.userStats = null;

        this.init();
    }

    init() {
        this.loadLeaderboard();
    }

    switchLeaderboard(type) {
        this.currentType = type;

        const headers = {
            scoreHighest: 'Highest Score',
            scoreLifetime: 'Lifetime Score',
            gamesPlayed: 'Games Played',
            wordsEnteredLifetime: 'Words Entered'
        }
        document.getElementById("stat-header").textContent = headers[type];

        this.loadLeaderboard();
    }

    async loadLeaderboard() {
        this.showLoading();

        

        try {
            const response = await this.fetchLeaderboardData();

            if (response.success) {
                this.data = response.data;
                this.userStats = response.userStats;
                this.renderLeaderboard();
                this.renderUserStats();
                this.hideLoading();
            } else {
                console.error(response.error || 'Failed to load leaderboard data');
            }
        } catch (error) {
            console.error('Error fetching leaderboard data:', error);
            this.showError();
        }
    }

    async fetchLeaderboardData() {

        // TODO: replace with backend solution

        return {
            success: true,
            data: this.generateMockData(),
            userStats: this.generateMockUserStats()
        };

    }

    generateMockData() {
        const usernames = ['ProGamer123', 'WordMaster', 'QuickThink', 'BrainPower', 'LetterLord', 'VocabViking', 'WordWizard', 'ThinkFast', 'GameChamp', 'OokamiGamma'];
        const data = [];
        
        for (let i = 0; i < 10; i++) {
            const baseScore = Math.floor(Math.random() * 5000) + 1000;
            data.push({
                username: usernames[i],
                userID: `user-${i}`,
                scoreHighest: baseScore + Math.floor(Math.random() * 2000),
                scoreLifetime: baseScore * (Math.floor(Math.random() * 10) + 5),
                gamesPlayed: Math.floor(Math.random() * 50) + 10,
                wordsEnteredLifetime: Math.floor(Math.random() * 1000) + 200
            });
        }
        
        // Sort by current type
        data.sort((a, b) => b[this.currentType] - a[this.currentType]);
        return data;
    }

    generateMockUserStats() {
        return {
            scoreHighest: 4250,
            scoreLifetime: 28750,
            gamesPlayed: 32,
            wordsEnteredLifetime: 684,
            scoreHighestRank: 3,
            scoreLifetimeRank: 2,
            gamesPlayedRank: 5,
            wordsEnteredRank: 4
        };
    }

    renderLeaderboard() {
        const tbody = document.getElementById('leaderboard-body');
        tbody.innerHTML = '';
        
        this.data.forEach((player, index) => {
            const row = this.createPlayerRow(player, index + 1);
            tbody.appendChild(row);
        });
    }

    createPlayerRow(player, rank) {
        const row = document.createElement('tr');
        
        // Highlight current user
        if (player.username === this.currentUser) {
            row.classList.add('current-user');
        }
        
        // Rank cell
        const rankCell = document.createElement('td');
        rankCell.className = 'rank';
        if (rank === 1) rankCell.classList.add('gold');
        else if (rank === 2) rankCell.classList.add('silver');
        else if (rank === 3) rankCell.classList.add('bronze');
        
        if (rank <= 3) {
            const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
            rankCell.innerHTML = `${medals[rank]} ${rank}`;
        } else {
            rankCell.textContent = rank;
        }
        
        // Player cell
        const playerCell = document.createElement('td');
        playerCell.className = 'player';
        playerCell.textContent = player.username || `User-${player.userID.slice(-6)}`;
        
        // Main stat cell
        const statCell = document.createElement('td');
        statCell.className = 'stat-value';
        if (rank <= 3) statCell.classList.add('highlight');
        statCell.textContent = this.formatStatValue(player[this.currentType]);
        
        // Games played cell
        const gamesCell = document.createElement('td');
        gamesCell.textContent = player.gamesPlayed || 0;
        
        row.appendChild(rankCell);
        row.appendChild(playerCell);
        row.appendChild(statCell);
        row.appendChild(gamesCell);
        
        return row;
    }

    renderUserStats() {
        if (!this.userStats) return;
        
        const grid = document.getElementById('user-stats-grid');
        grid.innerHTML = '';
        
        const stats = [
            { label: 'Highest Score', value: this.userStats.scoreHighest, rank: this.userStats.scoreHighestRank },
            { label: 'Lifetime Score', value: this.userStats.scoreLifetime, rank: this.userStats.scoreLifetimeRank },
            { label: 'Games Played', value: this.userStats.gamesPlayed, rank: this.userStats.gamesPlayedRank },
            { label: 'Words Entered', value: this.userStats.wordsEnteredLifetime, rank: this.userStats.wordsEnteredRank }
        ];
        
        stats.forEach(stat => {
            const card = this.createUserStatCard(stat);
            grid.appendChild(card);
        });
    }

    createUserStatCard(stat) {
        const card = document.createElement('div');
        card.className = 'user-stat-card';
        
        card.innerHTML = `
            <div class="label">${stat.label}</div>
            <div class="value">${this.formatStatValue(stat.value)}</div>
            <div class="rank-info">Rank #${stat.rank || 'N/A'}</div>
        `;
        
        return card;
    }

    formatStatValue(value) {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
        } else if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'K';
        }
        return value?.toLocaleString() || '0';
    }
    
    showLoading() {
        document.getElementById('loading').style.display = 'flex';
        document.getElementById('leaderboard-wrapper').style.display = 'none';
        document.getElementById('error-message').style.display = 'none';
    }
    
    hideLoading() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('leaderboard-wrapper').style.display = 'block';
    }
    
    showError() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('leaderboard-wrapper').style.display = 'none';
        document.getElementById('error-message').style.display = 'block';
    }
}

// Global function for retry button :::
function loadLeaderboard() {
    if (window.leaderboard) {
        window.leaderboard.loadLeaderboard();
    }
}