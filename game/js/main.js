/**
 * Harmonies Through Time: Orlando Gibbons 400th Anniversary Game
 * Main JavaScript file
 */

// Import modules
import StateManager from './modules/stateManager.js';
import AudioModule from './modules/audio.js';
import DataLoader from './modules/dataLoader.js';

// Establish main namespace for the game
const HarmoniesGame = {
    // Configuration settings
    config: {
        version: '0.1.0',
        debug: true,
        gameTitle: 'Harmonies Through Time',
        canvasWidth: 1024,
        canvasHeight: 576,
        targetFPS: 60,
        audioEnabled: true,
        saveGameKey: 'harmonies_save_data'
    },
    
    // Game modules
    modules: {
        state: StateManager,
        audio: AudioModule,
        loader: DataLoader
    },
    
    // Game state management
    state: {
        currentScreen: 'loading', // loading, menu, game, credits
        isLoaded: false,
        progress: 0,
        gameStarted: false,
        musicPlaying: false
    },
    
    // Asset management
    assets: {
        images: {},
        audio: {},
        data: {}
    },
    
    // Game components (to be implemented)
    components: {
        // These will be populated as we develop the game
        ui: {},
        player: {},
        puzzles: {},
        music: {},
        story: {}
    },
    
    // Initialization function
    init: function() {
        if (this.config.debug) {
            console.log(`${this.config.gameTitle} v${this.config.version} initializing...`);
        }
        
        // Initialize modules
        this.initModules();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start asset loading
        this.queueAssets();
        
        // Log initialization complete
        if (this.config.debug) {
            console.log('Initialization complete.');
        }
    },
    
    // Initialize game modules
    initModules: function() {
        // Initialize state manager
        this.modules.state.init(StateManager.states.LOADING);
        
        // Initialize audio system
        this.modules.audio.init({
            musicVolume: 0.5,
            sfxVolume: 0.8,
            muted: false
        });
        
        // Set up loader callbacks
        this.modules.loader.onProgress(progress => {
            this.updateLoadingProgress(progress * 100);
        });
        
        this.modules.loader.onComplete(assets => {
            this.onAssetsLoaded(assets);
        });
    },
    
    // Queue assets for loading
    queueAssets: function() {
        // Queue JSON data files
        this.modules.loader.queueJSON('gibbons_facts', 'assets/data/gibbons_facts.json');
        
        // Start loading process
        this.modules.loader.startLoading();
    },
    
    // Event listener setup
    setupEventListeners: function() {
        // DOM ready event
        document.addEventListener('DOMContentLoaded', () => {
            this.onDOMReady();
        });
        
        // Window resize event
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Setup state change handlers
        this.modules.state.onStateChange(StateManager.states.MENU, () => {
            console.log('Menu state active');
            // Will implement menu setup later
        });
    },
    
    // DOM ready handler
    onDOMReady: function() {
        if (this.config.debug) {
            console.log('DOM loaded, game starting...');
        }
        
        // Setup DOM elements
        this.cacheElements();
        
        // Handle initial resize
        this.handleResize();
    },
    
    // Cache DOM elements for later use
    cacheElements: function() {
        this.elements = {
            gameContainer: document.getElementById('game-container'),
            canvasContainer: document.getElementById('game-canvas-container'),
            loadingScreen: document.getElementById('loading-screen'),
            loadingMessage: document.querySelector('.loading-message'),
            progressBar: document.querySelector('.progress')
        };
    },
    
    // Handle window resize
    handleResize: function() {
        // Responsive adjustments can be made here
        if (this.config.debug) {
            console.log('Window resized, adjusting layout...');
        }
    },
    
    // Update loading progress display
    updateLoadingProgress: function(progress) {
        if (this.elements && this.elements.progressBar) {
            this.elements.progressBar.style.width = `${progress}%`;
        }
        this.state.progress = progress;
    },
    
    // Assets loaded handler
    onAssetsLoaded: function(assets) {
        if (this.config.debug) {
            console.log('All assets loaded!');
        }
        
        // Store loaded assets
        this.assets = assets;
        this.state.isLoaded = true;
        
        // Wait a moment, then transition to menu
        setTimeout(() => {
            this.transitionToMenu();
        }, 1000);
    },
    
    // Transition to menu screen
    transitionToMenu: function() {
        // Hide loading screen (with a fade effect)
        if (this.elements && this.elements.loadingScreen) {
            this.elements.loadingScreen.style.opacity = 0;
            setTimeout(() => {
                this.elements.loadingScreen.style.display = 'none';
                
                // Change game state to menu
                this.modules.state.changeState(StateManager.states.MENU);
                
                // For now, just display a loaded message
                // This will be replaced with proper menu implementation
                alert(`${this.config.gameTitle} loaded successfully! Game implementation coming soon.`);
            }, 1000);
        }
    }
};

// Initialize the game when script loads
HarmoniesGame.init(); 