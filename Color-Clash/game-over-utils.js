import { GAME_CONFIG } from './config.js';

// Check if a player has won based on tower destruction
export function checkGameOverByTowers(towers, players) {
    // Make sure both players have built at least one tower in this game
    if (!players.red.hasBuiltTower || !players.blue.hasBuiltTower) {
        return null;
    }
    
    // Count how many towers each player has
    const redTowers = towers.filter(tower => tower.color === 'red').length;
    const blueTowers = towers.filter(tower => tower.color === 'blue').length;
    
    // If one player has no towers left, the other player wins
    if (redTowers === 0 && players.red.hasBuiltTower) {
        return 'blue';
    } else if (blueTowers === 0 && players.blue.hasBuiltTower) {
        return 'red';
    }
    
    // No winner yet
    return null;
}