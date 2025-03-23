// Bullet movement and creation utilities
import { GAME_CONFIG } from './config.js';

// Calculate bullet trajectory with spread
export function calculateBulletTrajectory(tower) {
    // Generate random angle within spread range
    const spreadAngle = (Math.random() * GAME_CONFIG.BULLET_SPREAD_ANGLE) - (GAME_CONFIG.BULLET_SPREAD_ANGLE / 2);
    const spreadRadians = (spreadAngle * Math.PI) / 180;
    
    // Calculate horizontal component
    const horizontalSpeed = Math.sin(spreadRadians) * GAME_CONFIG.BULLET_SPEED;
    
    return {
        horizontalSpeed,
        spreadAngle
    };
}

// Update bullet positions with proper trajectory
export function updateBulletPosition(bullet, deltaTime) {
    // Calculate vertical movement
    const verticalSpeed = GAME_CONFIG.BULLET_SPEED * bullet.direction;
    
    // Get the cell size for responsive calculations
    const cellSize = document.querySelector('.grid-cell').getBoundingClientRect().width;
    
    // Apply movement with time-based physics and responsive cell size
    bullet.y += verticalSpeed * deltaTime * cellSize;
    bullet.x += bullet.horizontalSpeed * deltaTime * cellSize;
    
    // Update row/col based on position
    const gridElement = document.getElementById('game-grid');
    const cellHeight = gridElement.getBoundingClientRect().height / GAME_CONFIG.GRID_ROWS;
    const cellWidth = gridElement.getBoundingClientRect().width / GAME_CONFIG.GRID_COLS;
    
    bullet.row = Math.floor(bullet.y / cellHeight);
    bullet.col = Math.floor(bullet.x / cellWidth);
    
    return bullet;
}