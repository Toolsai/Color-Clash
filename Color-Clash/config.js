// Game configuration parameters
export const GAME_CONFIG = {
    // Grid configuration
    GRID_ROWS: 20,
    GRID_COLS: 10,
    RED_TERRITORY_END: 10,  // Row index where red territory ends
    
    // Game mechanics
    INITIAL_GOLD: 10,
    GOLD_PER_SECOND: 1,
    
    // Towers
    TOWER_COST: 10,
    TOWER_UPGRADE_COST: 10,  // Base upgrade cost increased to 10
    TOWER_UPGRADE_COST_MULTIPLIER: 2, // Cost doubles per level (changed from 1.5)
    MAX_TOWER_LEVEL: 5,
    TOWER_FIRE_INTERVAL_BASE: 1000,  // Base fire interval in ms (1 bullet per second)
    
    // Bullets
    BULLET_SPEED: 2,  // Grid cells per second
    BULLET_UPDATE_INTERVAL: 16,  // ms between bullet position updates (lowered for smoother motion)
    BULLET_SPREAD_ANGLE: 90,    // Maximum bullet spread angle in degrees (increased from 30 to 90)
    
    // AI settings
    AI_DECISION_INTERVAL: 2000,  // Time between AI decisions in ms
    AI_BUILD_PROBABILITY: 0.7,   // Probability AI will build a tower when it can
    AI_UPGRADE_PROBABILITY: 0.5, // Probability AI will upgrade a tower when it can
    
    // Victory conditions
    VICTORY_BY_TERRITORY: true,  // Win by controlling all territory
    VICTORY_BY_TOWERS: true,     // Win by destroying all enemy towers
    
    // Colors
    RED_COLOR: "#e94560",
    RED_TOWER_COLOR: "#a90000",
    RED_TOWER_BORDER: "#ff3333",
    BLUE_COLOR: "#4d80e4",
    BLUE_TOWER_COLOR: "#0033a9",
    BLUE_TOWER_BORDER: "#3366ff",
    BULLET_COLOR: "#ffc107",
    
    // Sound settings
    SOUND_ENABLED: true,
    SOUND_VOLUME: 0.5
};