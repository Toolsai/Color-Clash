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
    
    // Apply movement with time-based physics
    bullet.y += verticalSpeed * deltaTime * 40; // 40px per cell
    bullet.x += bullet.horizontalSpeed * deltaTime * 40;
    
    // Update row/col based on position
    bullet.row = Math.floor(bullet.y / 40);
    bullet.col = Math.floor(bullet.x / 40);
    
    return bullet;
}