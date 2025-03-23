import { GAME_CONFIG } from './config.js';
import { calculateUpgradeCost } from './tower-utils.js';

// Handle cell click event - moved from game.js
export function handleCellClick(row, col, game) {
    const cell = game.grid[row][col];
    
    // Clear previous selection highlight
    if (game.selectedCell) {
        game.grid[game.selectedCell.row][game.selectedCell.col].element.classList.remove('selected');
    }
    
    game.selectedCell = { row, col };
    
    // Highlight the selected cell
    cell.element.classList.add('selected');
    
    const actionPanel = document.getElementById('action-panel');
    const buildButton = document.getElementById('build-tower');
    const upgradeButton = document.getElementById('upgrade-tower');
    
    // Reset button states
    buildButton.disabled = false;
    upgradeButton.disabled = false;
    
    if (cell.hasTower) {
        // Show upgrade option
        buildButton.style.display = 'none';
        upgradeButton.style.display = 'block';
        
        const tower = game.getTowerAt(row, col);
        if (tower && tower.level >= GAME_CONFIG.MAX_TOWER_LEVEL) {
            upgradeButton.disabled = true;
        }
        
        // Calculate upgrade cost based on current level
        const upgradeCost = calculateUpgradeCost(tower.level);
            
        upgradeButton.textContent = `Upgrade Tower (${upgradeCost} Gold)`;
        
        if (game.players.blue.gold < upgradeCost) {
            upgradeButton.disabled = true;
        }
    } else {
        // Show build option
        buildButton.style.display = 'block';
        upgradeButton.style.display = 'none';
        
        if (game.players.blue.gold < GAME_CONFIG.TOWER_COST) {
            buildButton.disabled = true;
        }
    }
    
    // Position action panel next to the cell
    const cellRect = cell.element.getBoundingClientRect();
    const gridRect = document.getElementById('game-grid').getBoundingClientRect();
    
    // Get window dimensions for responsive positioning
    const windowWidth = window.innerWidth;
    
    // Check if it's a mobile device
    const isMobile = windowWidth < 768;
    
    // Default panel width
    const panelWidth = isMobile ? 120 : 180;
    
    // Check if there's space to the right, otherwise show to the left
    const spaceToRight = windowWidth - (cellRect.right + 10 + panelWidth);
    
    // Position panel based on available space and device type
    if (isMobile) {
        // For mobile, position panel above the cell or below based on available space
        const cellHeight = cellRect.height;
        const panelHeight = 120; // Approximate panel height
        
        if (cellRect.top > panelHeight) {
            // Position above
            actionPanel.style.left = `${cellRect.left - gridRect.left + (cellRect.width / 2) - (panelWidth / 2)}px`;
            actionPanel.style.top = `${cellRect.top - gridRect.top - panelHeight}px`;
        } else {
            // Position below
            actionPanel.style.left = `${cellRect.left - gridRect.left + (cellRect.width / 2) - (panelWidth / 2)}px`;
            actionPanel.style.top = `${cellRect.bottom - gridRect.top + 5}px`;
        }
    } else {
        // For desktop, position to right or left as usual
        if (spaceToRight > 0) {
            actionPanel.style.left = `${cellRect.right - gridRect.left + 10}px`;
        } else {
            actionPanel.style.left = `${cellRect.left - gridRect.left - panelWidth - 10}px`;
        }
        actionPanel.style.top = `${cellRect.top - gridRect.top}px`;
    }
    
    actionPanel.style.display = 'flex';
}

// Hide action panel - moved from game.js
export function hideActionPanel(game) {
    document.getElementById('action-panel').style.display = 'none';
    
    // Remove highlight from selected cell
    if (game.selectedCell) {
        game.grid[game.selectedCell.row][game.selectedCell.col].element.classList.remove('selected');
        game.selectedCell = null;
    }
}