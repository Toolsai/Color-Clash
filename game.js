import { GAME_CONFIG } from './config.js';
import { calculateBulletTrajectory, updateBulletPosition } from './bullet-utils.js';
import { calculateUpgradeCost, renderTower } from './tower-utils.js';
import { renderBullet, handleBulletImpact, createBullet } from './bullet-handlers.js';
import { checkGameOverByTowers } from './game-over-utils.js';
import { handleCellClick, hideActionPanel } from './ui-utils.js';
import { makeStrategicAIDecision } from './ai-utils.js';
import { setupResponsiveHandling } from './responsive-utils.js';

class TowerDefenseGame {
    constructor() {
        this.grid = [];
        this.towers = [];
        this.bullets = [];
        this.selectedCell = null;
        this.gameOver = false;
        this.winner = null;
        
        this.players = {
            red: {
                color: 'red',
                gold: GAME_CONFIG.INITIAL_GOLD,
                direction: 1,  // Bullets move down
                territory: { start: 0, end: GAME_CONFIG.RED_TERRITORY_END - 1 },
                hasBuiltTower: false
            },
            blue: {
                color: 'blue',
                gold: GAME_CONFIG.INITIAL_GOLD,
                direction: -1, // Bullets move up
                territory: { start: GAME_CONFIG.RED_TERRITORY_END, end: GAME_CONFIG.GRID_ROWS - 1 },
                hasBuiltTower: false
            }
        };
        
        this.setupGame();
        this.setupEventListeners();
        this.startGameLoop();
        setupResponsiveHandling(this);
    }
    
    setupGame() {
        // Create the grid
        const gridElement = document.getElementById('game-grid');
        gridElement.innerHTML = '';
        
        this.grid = [];
        
        for (let row = 0; row < GAME_CONFIG.GRID_ROWS; row++) {
            this.grid[row] = [];
            
            for (let col = 0; col < GAME_CONFIG.GRID_COLS; col++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                
                if (row < GAME_CONFIG.RED_TERRITORY_END) {
                    cell.classList.add('red');
                    this.grid[row][col] = { color: 'red', hasTower: false };
                } else {
                    cell.classList.add('blue');
                    this.grid[row][col] = { color: 'blue', hasTower: false };
                }
                
                cell.dataset.row = row;
                cell.dataset.col = col;
                gridElement.appendChild(cell);
                
                this.grid[row][col].element = cell;
            }
        }
        
        // Initialize player gold display
        document.getElementById('red-gold').textContent = this.players.red.gold;
        document.getElementById('blue-gold').textContent = this.players.blue.gold;
        
        // Hide action panel and game over screen
        document.getElementById('action-panel').style.display = 'none';
        document.getElementById('game-over').style.display = 'none';
    }
    
    setupEventListeners() {
        // Grid cell click
        document.getElementById('game-grid').addEventListener('click', (e) => {
            if (this.gameOver) return;
            
            const cell = e.target.closest('.grid-cell');
            if (!cell) return;
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            // Only allow blue player (human) to interact with their territory
            if (row >= GAME_CONFIG.RED_TERRITORY_END) {
                handleCellClick(row, col, this);
            }
        });
        
        // Action buttons
        document.getElementById('build-tower').addEventListener('click', () => {
            this.buildTower(this.selectedCell.row, this.selectedCell.col, 'blue');
            hideActionPanel(this);
        });
        
        document.getElementById('upgrade-tower').addEventListener('click', () => {
            this.upgradeTower(this.selectedCell.row, this.selectedCell.col);
            // Don't hide panel after upgrade to allow consecutive upgrades
        });
        
        document.getElementById('cancel-action').addEventListener('click', () => {
            hideActionPanel(this);
        });
        
        // Restart button
        document.getElementById('restart-game').addEventListener('click', () => {
            this.restart();
        });
    }
    
    startGameLoop() {
        // Start gold income
        this.goldInterval = setInterval(() => {
            this.players.red.gold += GAME_CONFIG.GOLD_PER_SECOND;
            this.players.blue.gold += GAME_CONFIG.GOLD_PER_SECOND;
            
            document.getElementById('red-gold').textContent = this.players.red.gold;
            document.getElementById('blue-gold').textContent = this.players.blue.gold;
        }, 1000);
        
        // Start bullet updates
        this.bulletInterval = setInterval(() => {
            this.updateBullets();
        }, GAME_CONFIG.BULLET_UPDATE_INTERVAL);
        
        // Start AI decision making
        this.aiInterval = setInterval(() => {
            this.makeAIDecision();
        }, GAME_CONFIG.AI_DECISION_INTERVAL);
        
        // Check for game over condition
        this.gameOverCheckInterval = setInterval(() => {
            this.checkGameOver();
        }, 1000);
    }
    
    buildTower(row, col, color) {
        const player = this.players[color];
        
        // Check if in correct territory
        if ((color === 'red' && row >= GAME_CONFIG.RED_TERRITORY_END) || 
            (color === 'blue' && row < GAME_CONFIG.RED_TERRITORY_END)) {
            return false;
        }
        
        // Check if cell already has a tower
        if (this.grid[row][col].hasTower) {
            return false;
        }
        
        // Check if player has enough gold
        if (player.gold < GAME_CONFIG.TOWER_COST) {
            return false;
        }
        
        // Create tower
        const tower = {
            row: row,
            col: col,
            color: color,
            level: 1,
            lastFired: 0
        };
        
        // Add tower to list
        this.towers.push(tower);
        
        // Update grid
        this.grid[row][col].hasTower = true;
        
        // Mark that this player has built a tower
        player.hasBuiltTower = true;
        
        // Render tower
        renderTower(tower, this.grid);
        
        // Deduct gold
        player.gold -= GAME_CONFIG.TOWER_COST;
        document.getElementById(`${color}-gold`).textContent = player.gold;
        
        return true;
    }
    
    upgradeTower(row, col) {
        const tower = this.getTowerAt(row, col);
        
        if (!tower) return false;
        
        const player = this.players[tower.color];
        
        // Check if tower is at max level
        if (tower.level >= GAME_CONFIG.MAX_TOWER_LEVEL) {
            return false;
        }
        
        // Calculate upgrade cost based on current level
        const upgradeCost = calculateUpgradeCost(tower.level);
        
        // Check if player has enough gold
        if (player.gold < upgradeCost) {
            return false;
        }
        
        // Upgrade tower
        tower.level++;
        
        // Update tower display
        renderTower(tower, this.grid);
        
        // Deduct gold
        player.gold -= upgradeCost;
        document.getElementById(`${tower.color}-gold`).textContent = player.gold;
        
        // If the cell is still selected, update the upgrade button text and state
        if (this.selectedCell && this.selectedCell.row === row && this.selectedCell.col === col) {
            const upgradeButton = document.getElementById('upgrade-tower');
            
            if (tower.level >= GAME_CONFIG.MAX_TOWER_LEVEL) {
                upgradeButton.disabled = true;
            } else {
                // Calculate new upgrade cost
                const newUpgradeCost = calculateUpgradeCost(tower.level);
                upgradeButton.textContent = `Upgrade Tower (${newUpgradeCost} Gold)`;
                
                // Disable if not enough gold
                if (player.gold < newUpgradeCost) {
                    upgradeButton.disabled = true;
                }
            }
        }
        
        return true;
    }
    
    getTowerAt(row, col) {
        return this.towers.find(tower => tower.row === row && tower.col === col);
    }
    
    fireTower(tower) {
        const now = Date.now();
        const fireInterval = GAME_CONFIG.TOWER_FIRE_INTERVAL_BASE / tower.level;
        
        if (now - tower.lastFired < fireInterval) {
            return;
        }
        
        tower.lastFired = now;
        
        // Create bullet using the new module
        const bullet = createBullet(tower, this.players);
        
        this.bullets.push(bullet);
        renderBullet(bullet);
        
        // Play sound
        this.playSound('shoot');
    }
    
    updateBullets() {
        const now = Date.now();
        
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            if (!bullet.active) {
                if (bullet.element) {
                    bullet.element.remove();
                }
                this.bullets.splice(i, 1);
                continue;
            }
            
            // Calculate deltaTime in seconds
            const deltaTime = (now - (bullet.lastUpdate || bullet.createdAt)) / 1000;
            bullet.lastUpdate = now;
            
            // Update bullet position with smooth trajectory
            updateBulletPosition(bullet, deltaTime);
            
            // Check if bullet is out of bounds
            if (bullet.row < 0 || bullet.row >= GAME_CONFIG.GRID_ROWS || 
                bullet.col < 0 || bullet.col >= GAME_CONFIG.GRID_COLS) {
                bullet.active = false;
                continue;
            }
            
            // Check for collision with enemy cell
            const cell = this.grid[bullet.row][bullet.col];
            if (cell.color !== bullet.color) {
                // Hit enemy cell
                handleBulletImpact(bullet, bullet.row, bullet.col, this.grid, this.players, this.towers, this.playSound.bind(this));
                bullet.active = false;
                continue;
            }
            
            // Update bullet on screen
            renderBullet(bullet);
        }
    }
    
    makeAIDecision() {
        if (this.gameOver) return;
        
        // Use the strategic AI decision making from ai-utils.js
        const decision = makeStrategicAIDecision(this);
        
        // Execute the decision
        switch (decision.action) {
            case 'build':
                this.buildTower(decision.position.row, decision.position.col, 'red');
                break;
            case 'upgrade':
                this.upgradeTower(decision.tower.row, decision.tower.col);
                break;
            case 'save':
                // Do nothing, save gold
                break;
        }
    }
    
    checkGameOver() {
        // Check for tower-based victory
        if (GAME_CONFIG.VICTORY_BY_TOWERS) {
            const winner = checkGameOverByTowers(this.towers, this.players);
            if (winner) {
                this.endGame(winner);
                return;
            }
        }
        
        // Check for territory-based victory
        if (GAME_CONFIG.VICTORY_BY_TERRITORY) {
            // Count cells by color
            let redCount = 0;
            let blueCount = 0;
            
            for (let row = 0; row < GAME_CONFIG.GRID_ROWS; row++) {
                for (let col = 0; col < GAME_CONFIG.GRID_COLS; col++) {
                    if (this.grid[row][col].color === 'red') {
                        redCount++;
                    } else {
                        blueCount++;
                    }
                }
            }
            
            const totalCells = GAME_CONFIG.GRID_ROWS * GAME_CONFIG.GRID_COLS;
            
            if (redCount === totalCells) {
                this.endGame('red');
            } else if (blueCount === totalCells) {
                this.endGame('blue');
            }
        }
    }
    
    endGame(winner) {
        this.gameOver = true;
        this.winner = winner;
        
        // Stop intervals
        clearInterval(this.goldInterval);
        clearInterval(this.bulletInterval);
        clearInterval(this.aiInterval);
        clearInterval(this.gameOverCheckInterval);
        
        // Show game over screen
        const gameOverScreen = document.getElementById('game-over');
        const winnerText = document.getElementById('winner-text');
        
        if (winner === 'red') {
            winnerText.textContent = 'AI Player (Red) Wins!';
            winnerText.style.color = GAME_CONFIG.RED_COLOR;
        } else {
            winnerText.textContent = 'Player (Blue) Wins!';
            winnerText.style.color = GAME_CONFIG.BLUE_COLOR;
        }
        
        gameOverScreen.style.display = 'flex';
        
        // Play victory sound
        this.playSound('victory');
    }
    
    restart() {
        // Clean up
        for (const bullet of this.bullets) {
            if (bullet.element) {
                bullet.element.remove();
            }
        }
        
        // Reset game state
        this.grid = [];
        this.towers = [];
        this.bullets = [];
        this.selectedCell = null;
        this.gameOver = false;
        this.winner = null;
        
        this.players.red.gold = GAME_CONFIG.INITIAL_GOLD;
        this.players.blue.gold = GAME_CONFIG.INITIAL_GOLD;
        this.players.red.hasBuiltTower = false;
        this.players.blue.hasBuiltTower = false;
        
        // Reinitialize the game
        this.setupGame();
        this.startGameLoop();
    }
    
    playSound(type) {
        if (!GAME_CONFIG.SOUND_ENABLED) return;
        
        // Create audio elements as needed
        // In a real implementation, these would be preloaded
        const sound = new Audio();
        sound.volume = GAME_CONFIG.SOUND_VOLUME;
        
        switch (type) {
            case 'shoot':
                // Use oscillator for shoot sound
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.1);
                
                gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
                
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.1);
                return;
                
            case 'explosion':
                // Use oscillator for explosion sound
                const explosionCtx = new (window.AudioContext || window.webkitAudioContext)();
                const noise = explosionCtx.createOscillator();
                const explosionGain = explosionCtx.createGain();
                
                noise.type = 'sawtooth';
                noise.frequency.setValueAtTime(100, explosionCtx.currentTime);
                noise.frequency.exponentialRampToValueAtTime(50, explosionCtx.currentTime + 0.3);
                
                explosionGain.gain.setValueAtTime(0.5, explosionCtx.currentTime);
                explosionGain.gain.exponentialRampToValueAtTime(0.01, explosionCtx.currentTime + 0.3);
                
                noise.connect(explosionGain);
                explosionGain.connect(explosionCtx.destination);
                
                noise.start();
                noise.stop(explosionCtx.currentTime + 0.3);
                return;
                
            case 'victory':
                // Use oscillator for victory sound
                const victoryCtx = new (window.AudioContext || window.webkitAudioContext)();
                const melody = victoryCtx.createOscillator();
                const melodyGain = victoryCtx.createGain();
                
                melody.type = 'sine';
                melody.frequency.setValueAtTime(440, victoryCtx.currentTime);
                melody.frequency.setValueAtTime(550, victoryCtx.currentTime + 0.2);
                melody.frequency.setValueAtTime(660, victoryCtx.currentTime + 0.4);
                melody.frequency.setValueAtTime(880, victoryCtx.currentTime + 0.6);
                
                melodyGain.gain.setValueAtTime(0.4, victoryCtx.currentTime);
                melodyGain.gain.exponentialRampToValueAtTime(0.01, victoryCtx.currentTime + 0.8);
                
                melody.connect(melodyGain);
                melodyGain.connect(victoryCtx.destination);
                
                melody.start();
                melody.stop(victoryCtx.currentTime + 0.8);
                return;
        }
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new TowerDefenseGame();
    
    // Fire bullets from towers periodically
    setInterval(() => {
        if (game.gameOver) return;
        
        for (const tower of game.towers) {
            game.fireTower(tower);
        }
    }, 100); // Check frequently to ensure smooth firing based on tower levels
});