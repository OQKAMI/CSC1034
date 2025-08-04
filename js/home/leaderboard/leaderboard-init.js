// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the leaderboard first
    window.leaderboard = new Leaderboard();
    window.leaderboard.currentUser = 'OokamiGamma';
    
    // Initialize the selector after leaderboard
    const selector = new LeaderboardSelector();
    
    // Connect selector to leaderboard with correct method name
    selector.onChange((typeData) => {
        console.log('Leaderboard type changed to:', typeData);
        // Use switchLeaderboard instead of setType
        window.leaderboard.switchLeaderboard(typeData.key);
    });
    
    // Set initial type
    selector.setCurrentType('scoreHighest');
});