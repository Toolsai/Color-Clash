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
    
    // Check if there's space to the right, otherwise show to the left
    const spaceToRight = window.innerWidth - (cellRect.right + 10 + 180); // 180px is panel width
    
    if (spaceToRight > 0) {
        actionPanel.style.left = `${cellRect.right - gridRect.left + 10}px`;
    } else {
        actionPanel.style.left = `${cellRect.left - gridRect.left - 190}px`; // 180px panel width + 10px margin
    }
    
    actionPanel.style.top = `${cellRect.top - gridRect.top}px`;
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