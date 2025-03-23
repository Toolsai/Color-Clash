// Utility functions for handling responsive design

// Calculate cell size based on current grid dimensions
export function getCellDimensions() {
    const gridElement = document.getElementById('game-grid');
    const gridRect = gridElement.getBoundingClientRect();
    
    return {
        width: gridRect.width / 10, // 10 columns
        height: gridRect.height / 20 // 20 rows
    };
}

// Enhanced mobile detection and handling
export function isMobileDevice() {
    return window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

// Ensure content fits on iOS devices
export function setupIOSCompatibility() {
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        // Adjust viewport height for iOS
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Listen for resize/orientation changes
        window.addEventListener('resize', () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        });
    }
}

// Update positioning on window resize
export function setupResponsiveHandling(game) {
    // Setup iOS specific compatibility
    setupIOSCompatibility();
    
    window.addEventListener('resize', () => {
        // Reposition all bullets
        for (const bullet of game.bullets) {
            if (bullet.active && bullet.element) {
                // Get current cell dimensions
                const dims = getCellDimensions();
                
                // Update positions of all bullets
                bullet.x = bullet.col * dims.width + dims.width / 2;
                bullet.y = bullet.row * dims.height + dims.height / 2;
                
                // Update display
                bullet.element.style.left = `${bullet.x - 5}px`; // Center the 10px bullet
                bullet.element.style.top = `${bullet.y - 5}px`;  // Center the 10px bullet
            }
        }
        
        // Hide action panel to prevent positioning issues
        document.getElementById('action-panel').style.display = 'none';
        if (game.selectedCell) {
            game.grid[game.selectedCell.row][game.selectedCell.col].element.classList.remove('selected');
            game.selectedCell = null;
        }
    });
}