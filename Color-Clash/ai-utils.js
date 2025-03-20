import { GAME_CONFIG } from './config.js';
import { calculateUpgradeCost } from './tower-utils.js';

// Get all available positions for building in red territory
export function getAvailableBuildPositions(grid) {
    const availablePositions = [];
    for (let row = 0; row < GAME_CONFIG.RED_TERRITORY_END; row++) {
        for (let col = 0; col < GAME_CONFIG.GRID_COLS; col++) {
            if (!grid[row][col].hasTower && grid[row][col].color === 'red') {
                availablePositions.push({ row, col });
            }
        }
    }
    return availablePositions;
}

// Get all towers that can be upgraded
export function getUpgradableTowers(towers) {
    return towers.filter(tower => 
        tower.color === 'red' && 
        tower.level < GAME_CONFIG.MAX_TOWER_LEVEL
    );
}

// Calculate optimal tower placement prioritizing front lines
export function calculateOptimalTowerPlacement(grid, availablePositions) {
    // Prioritize positions closer to enemy territory
    return availablePositions.sort((a, b) => b.row - a.row);
}

// Calculate tower upgrade priorities
export function calculateTowerUpgradePriorities(towers, grid) {
    return towers.map(tower => {
        // Calculate priority score based on:
        // 1. Tower position (prefer front line)
        // 2. Current level (prefer lower levels due to cost efficiency)
        // 3. Proximity to enemy territory or enemy towers
        const positionScore = tower.row / GAME_CONFIG.RED_TERRITORY_END;
        const levelScore = (GAME_CONFIG.MAX_TOWER_LEVEL - tower.level) / GAME_CONFIG.MAX_TOWER_LEVEL;
        
        return {
            tower: tower,
            priority: positionScore * 0.7 + levelScore * 0.3,
            cost: calculateUpgradeCost(tower.level)
        };
    }).sort((a, b) => b.priority - a.priority); // Sort by priority descending
}

// Make strategic AI decision based on current game state
export function makeStrategicAIDecision(game) {
    const player = game.players.red;
    
    // Get available build positions
    const availablePositions = getAvailableBuildPositions(game.grid);
    
    // Get upgradable towers
    const upgradableTowers = getUpgradableTowers(game.towers);
    
    // Optimal build positions prioritizing front lines
    const optimalPositions = calculateOptimalTowerPlacement(game.grid, availablePositions);
    
    // Calculate upgrade priorities for existing towers
    const towerUpgradePriorities = calculateTowerUpgradePriorities(upgradableTowers, game.grid);
    
    // Filter affordable options
    const affordableBuildPositions = optimalPositions.length > 0 ? [optimalPositions[0]] : [];
    const affordableUpgrades = towerUpgradePriorities.filter(item => item.cost <= player.gold);
    
    // Strategy factors
    const blueTowers = game.towers.filter(tower => tower.color === 'blue').length;
    const redTowers = game.towers.filter(tower => tower.color === 'red').length;
    const totalRedCells = countCellsByColor(game.grid, 'red');
    const totalBlueCells = countCellsByColor(game.grid, 'blue');
    
    // Adjust probabilities based on game state
    let buildProbability = GAME_CONFIG.AI_BUILD_PROBABILITY;
    let upgradeProbability = GAME_CONFIG.AI_UPGRADE_PROBABILITY;
    
    // If enemy has more towers, prioritize building
    if (blueTowers > redTowers) {
        buildProbability += 0.2;
    }
    
    // If losing territory, prioritize upgrades to existing towers
    if (totalRedCells < totalBlueCells) {
        upgradeProbability += 0.2;
    }
    
    // If very few towers, always try to build
    if (redTowers < 3) {
        buildProbability = 0.9;
    }
    
    // If early game or low on gold, save some for future turns
    if (player.gold < 20) {
        buildProbability *= 0.8;
        upgradeProbability *= 0.8;
    }
    
    // Make decision
    if (player.gold >= GAME_CONFIG.TOWER_COST && affordableBuildPositions.length > 0 && 
        Math.random() < buildProbability) {
        // Build a new tower at optimal position
        return {
            action: 'build',
            position: affordableBuildPositions[0]
        };
    } else if (affordableUpgrades.length > 0 && Math.random() < upgradeProbability) {
        // Upgrade highest priority tower
        return {
            action: 'upgrade',
            tower: affordableUpgrades[0].tower
        };
    }
    
    // Save gold for now
    return { action: 'save' };
}

// Count cells by color
function countCellsByColor(grid, color) {
    let count = 0;
    for (let row = 0; row < GAME_CONFIG.GRID_ROWS; row++) {
        for (let col = 0; col < GAME_CONFIG.GRID_COLS; col++) {
            if (grid[row][col].color === color) {
                count++;
            }
        }
    }
    return count;
}