import { GAME_CONFIG } from './config.js';
import { calculateBulletTrajectory, updateBulletPosition } from './bullet-utils.js';
import { showExplosion } from './tower-utils.js';
import { playCellCaptureSound } from './sound-utils.js';

// Handle bullet rendering
export function renderBullet(bullet) {
    // Create bullet element if it doesn't exist
    if (!bullet.element) {
        const bulletElement = document.createElement('div');
        bulletElement.classList.add('bullet');
        document.getElementById('game-grid').appendChild(bulletElement);
        bullet.element = bulletElement;
    }
    
    // Update position
    bullet.element.style.left = `${bullet.x - 5}px`; // Center the 10px bullet
    bullet.element.style.top = `${bullet.y - 5}px`;  // Center the 10px bullet
}

// Handle bullet impact with enemy territory
export function handleBulletImpact(bullet, row, col, grid, players, towers, playSound) {
    const cell = grid[row][col];
    
    // Check if there's a tower
    if (cell.hasTower) {
        destroyTower(row, col, grid, towers);
        playSound('explosion');
        showExplosion(row, col, grid);
    }
    
    // Change cell color
    changeCellColor(row, col, bullet.color, grid);
    
    // Remove bullet
    if (bullet.element) {
        bullet.element.remove();
    }
    
    // Award gold for hitting enemy territory
    const player = players[bullet.color];
    player.gold += 1;
    document.getElementById(`${bullet.color}-gold`).textContent = player.gold;
    
    // Play cell capture sound
    playCellCaptureSound();
}

// Create a bullet
export function createBullet(tower, players) {
    const now = Date.now();
    
    // Create bullet
    const bullet = {
        row: tower.row,
        col: tower.col,
        color: tower.color,
        direction: players[tower.color].direction,
        y: tower.row * 40 + 20, // Center of cell
        x: tower.col * 40 + 20, // Center of cell
        active: true,
        createdAt: now
    };
    
    // Calculate trajectory with spread
    const trajectory = calculateBulletTrajectory(tower);
    bullet.horizontalSpeed = trajectory.horizontalSpeed;
    bullet.spreadAngle = trajectory.spreadAngle;
    
    return bullet;
}

// Destroy tower
function destroyTower(row, col, grid, towers) {
    // Find and remove tower from list
    const towerIndex = towers.findIndex(t => t.row === row && t.col === col);
    
    if (towerIndex !== -1) {
        towers.splice(towerIndex, 1);
    }
    
    // Update grid
    grid[row][col].hasTower = false;
    
    // Remove tower element
    const towerElement = grid[row][col].element.querySelector('.tower');
    if (towerElement) {
        towerElement.remove();
    }
}

// Change cell color
function changeCellColor(row, col, color, grid) {
    const cell = grid[row][col];
    
    // Update data
    cell.color = color;
    
    // Update visual
    cell.element.className = `grid-cell ${color}`;
}