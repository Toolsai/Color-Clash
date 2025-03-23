// Tower-related utility functions
import { GAME_CONFIG } from './config.js';

// Calculate tower upgrade cost based on current level
export function calculateUpgradeCost(level) {
    return GAME_CONFIG.TOWER_UPGRADE_COST * Math.pow(GAME_CONFIG.TOWER_UPGRADE_COST_MULTIPLIER, level - 1);
}

// Render tower on screen
export function renderTower(tower, grid) {
    const cell = grid[tower.row][tower.col].element;
    
    // Remove existing tower if any
    const existingTower = cell.querySelector('.tower');
    if (existingTower) {
        cell.removeChild(existingTower);
    }
    
    // Create tower element
    const towerElement = document.createElement('div');
    towerElement.classList.add('tower', tower.color);
    towerElement.textContent = `x${tower.level}`;
    
    cell.appendChild(towerElement);
}

// Create explosion effect when tower is destroyed
export function showExplosion(row, col, grid) {
    const cell = grid[row][col].element;
    const explosion = document.createElement('div');
    explosion.classList.add('explosion');
    
    // Create SVG explosion
    explosion.innerHTML = `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" fill="orange" />
            <circle cx="50" cy="50" r="30" fill="yellow" />
            <circle cx="50" cy="50" r="20" fill="white" />
        </svg>
    `;
    
    cell.appendChild(explosion);
    
    // Remove explosion after animation completes
    setTimeout(() => {
        explosion.remove();
    }, 500);
}