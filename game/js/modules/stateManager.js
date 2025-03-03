/**
 * State Manager Module
 * Handles game state transitions and management
 */

const StateManager = (function() {
    // Private variables
    const states = {
        LOADING: 'loading',
        MENU: 'menu',
        STORY: 'story',
        GAMEPLAY: 'gameplay',
        PUZZLE: 'puzzle',
        MUSIC_GAME: 'music_game',
        PAUSE: 'pause',
        ENCYCLOPEDIA: 'encyclopedia',
        CREDITS: 'credits'
    };
    
    let currentState = states.LOADING;
    let previousState = null;
    let stateChangeCallbacks = {};
    let stateData = {};
    
    // State transition handlers
    const stateHandlers = {
        // Default handlers for common transitions
        // These will be expanded as we develop the game
        
        [states.LOADING]: {
            enter: function(data) {
                console.log('Entering loading state');
                // Initialize loading resources
            },
            exit: function() {
                console.log('Exiting loading state');
            }
        },
        
        [states.MENU]: {
            enter: function(data) {
                console.log('Entering menu state');
                // Show menu UI
            },
            exit: function() {
                console.log('Exiting menu state');
                // Hide menu UI
            }
        },
        
        [states.GAMEPLAY]: {
            enter: function(data) {
                console.log('Entering gameplay state');
                // Initialize gameplay
                if (data && data.location) {
                    console.log(`Loading location: ${data.location}`);
                }
            },
            exit: function() {
                console.log('Exiting gameplay state');
                // Clean up gameplay elements
            }
        }
    };
    
    // Public interface
    return {
        // Constants for state names
        states: states,
        
        /**
         * Initialize the state manager
         * @param {string} initialState - The initial state (defaults to LOADING)
         */
        init: function(initialState = states.LOADING) {
            console.log('State manager initialized');
            currentState = initialState;
            
            // Trigger the initial state's enter handler
            if (stateHandlers[currentState] && stateHandlers[currentState].enter) {
                stateHandlers[currentState].enter({});
            }
            
            return this;
        },
        
        /**
         * Change to a new state
         * @param {string} newState - The state to change to
         * @param {Object} data - Optional data to pass to the state
         */
        changeState: function(newState, data = {}) {
            if (newState === currentState) return this;
            
            console.log(`Changing state: ${currentState} -> ${newState}`);
            
            // Call exit handler for current state
            if (stateHandlers[currentState] && stateHandlers[currentState].exit) {
                stateHandlers[currentState].exit();
            }
            
            // Update state tracking
            previousState = currentState;
            currentState = newState;
            stateData[currentState] = data;
            
            // Call enter handler for new state
            if (stateHandlers[currentState] && stateHandlers[currentState].enter) {
                stateHandlers[currentState].enter(data);
            }
            
            // Trigger callbacks for this state change
            this._triggerCallbacks(currentState, data);
            
            return this;
        },
        
        /**
         * Register a state change handler
         * @param {string} state - The state to handle
         * @param {Object} handlers - Object with enter/exit functions
         */
        registerStateHandler: function(state, handlers) {
            stateHandlers[state] = handlers;
            return this;
        },
        
        /**
         * Register a callback for a specific state change
         * @param {string} state - The state to watch for
         * @param {Function} callback - Function to call when state is entered
         */
        onStateChange: function(state, callback) {
            if (!stateChangeCallbacks[state]) {
                stateChangeCallbacks[state] = [];
            }
            stateChangeCallbacks[state].push(callback);
            return this;
        },
        
        /**
         * Returns to the previous state
         * @param {Object} data - Optional data to pass to the state
         */
        returnToPreviousState: function(data = {}) {
            if (previousState) {
                this.changeState(previousState, data);
            }
            return this;
        },
        
        /**
         * Get the current state
         * @return {string} The current state
         */
        getCurrentState: function() {
            return currentState;
        },
        
        /**
         * Get data for the current state
         * @return {Object} The current state's data
         */
        getCurrentStateData: function() {
            return stateData[currentState] || {};
        },
        
        /**
         * Check if a specific state is active
         * @param {string} state - The state to check
         * @return {boolean} True if the specified state is active
         */
        isState: function(state) {
            return currentState === state;
        },
        
        /**
         * Save current game state to localStorage
         * @param {string} saveKey - Key to use for localStorage
         */
        saveState: function(saveKey) {
            const saveData = {
                state: currentState,
                data: stateData[currentState] || {},
                timestamp: Date.now()
            };
            
            try {
                localStorage.setItem(saveKey, JSON.stringify(saveData));
                console.log('Game state saved');
                return true;
            } catch (e) {
                console.error('Failed to save game state:', e);
                return false;
            }
        },
        
        /**
         * Load game state from localStorage
         * @param {string} saveKey - Key used in localStorage
         * @return {boolean} Success or failure
         */
        loadState: function(saveKey) {
            try {
                const saveData = JSON.parse(localStorage.getItem(saveKey));
                if (saveData && saveData.state) {
                    this.changeState(saveData.state, saveData.data || {});
                    console.log('Game state loaded');
                    return true;
                }
            } catch (e) {
                console.error('Failed to load game state:', e);
            }
            
            return false;
        },
        
        // Private method to trigger callbacks
        _triggerCallbacks: function(state, data) {
            if (stateChangeCallbacks[state]) {
                stateChangeCallbacks[state].forEach(callback => {
                    try {
                        callback(data);
                    } catch (e) {
                        console.error('Error in state change callback:', e);
                    }
                });
            }
        }
    };
})();

// Export the module
export default StateManager; 