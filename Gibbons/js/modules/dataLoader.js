/**
 * Data Loader Module
 * Handles loading of game assets and data
 */

const DataLoader = (function() {
    // Private variables
    let loadedAssets = {
        images: {},
        audio: {},
        json: {}
    };
    
    let loadQueue = [];
    let totalItems = 0;
    let loadedItems = 0;
    let onProgressCallback = null;
    let onCompleteCallback = null;
    let isLoading = false;
    
    /**
     * Load an image asset
     * @param {string} key - Identifier for the image
     * @param {string} url - URL of the image
     * @return {Promise} Promise that resolves when image is loaded
     */
    function loadImage(key, url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = function() {
                loadedAssets.images[key] = img;
                itemLoaded();
                resolve(img);
            };
            
            img.onerror = function() {
                console.error(`Failed to load image: ${url}`);
                itemLoaded();
                reject(new Error(`Failed to load image: ${url}`));
            };
            
            img.src = url;
        });
    }
    
    /**
     * Load an audio asset
     * @param {string} key - Identifier for the audio
     * @param {string} url - URL of the audio file
     * @return {Promise} Promise that resolves when audio is loaded
     */
    function loadAudio(key, url) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            
            audio.addEventListener('canplaythrough', function onCanPlay() {
                audio.removeEventListener('canplaythrough', onCanPlay);
                loadedAssets.audio[key] = audio;
                itemLoaded();
                resolve(audio);
            });
            
            audio.addEventListener('error', function() {
                console.error(`Failed to load audio: ${url}`);
                itemLoaded();
                reject(new Error(`Failed to load audio: ${url}`));
            });
            
            audio.src = url;
            audio.load();
        });
    }
    
    /**
     * Load a JSON data file
     * @param {string} key - Identifier for the data
     * @param {string} url - URL of the JSON file
     * @return {Promise} Promise that resolves when data is loaded
     */
    function loadJSON(key, url) {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                loadedAssets.json[key] = data;
                itemLoaded();
                return data;
            })
            .catch(error => {
                console.error(`Failed to load JSON: ${url}`, error);
                itemLoaded();
                throw error;
            });
    }
    
    /**
     * Track progress of loaded items
     */
    function itemLoaded() {
        loadedItems++;
        const progress = totalItems > 0 ? loadedItems / totalItems : 0;
        
        if (onProgressCallback) {
            onProgressCallback(progress);
        }
        
        if (loadedItems >= totalItems && onCompleteCallback) {
            isLoading = false;
            onCompleteCallback(loadedAssets);
        }
    }
    
    // Public interface
    return {
        /**
         * Add an image to the loading queue
         * @param {string} key - Identifier for the image
         * @param {string} url - URL of the image
         */
        queueImage: function(key, url) {
            loadQueue.push({
                type: 'image',
                key: key,
                url: url
            });
            totalItems++;
            return this;
        },
        
        /**
         * Add an audio file to the loading queue
         * @param {string} key - Identifier for the audio
         * @param {string} url - URL of the audio file
         */
        queueAudio: function(key, url) {
            loadQueue.push({
                type: 'audio',
                key: key,
                url: url
            });
            totalItems++;
            return this;
        },
        
        /**
         * Add a JSON file to the loading queue
         * @param {string} key - Identifier for the data
         * @param {string} url - URL of the JSON file
         */
        queueJSON: function(key, url) {
            loadQueue.push({
                type: 'json',
                key: key,
                url: url
            });
            totalItems++;
            return this;
        },
        
        /**
         * Set callback for load progress updates
         * @param {Function} callback - Function(progress) to call with progress (0-1)
         */
        onProgress: function(callback) {
            onProgressCallback = callback;
            return this;
        },
        
        /**
         * Set callback for when all assets are loaded
         * @param {Function} callback - Function(assets) to call when loading completes
         */
        onComplete: function(callback) {
            onCompleteCallback = callback;
            return this;
        },
        
        /**
         * Start loading all queued assets
         */
        startLoading: function() {
            if (isLoading) return this;
            
            isLoading = true;
            loadedItems = 0;
            
            if (loadQueue.length === 0) {
                if (onCompleteCallback) {
                    setTimeout(() => onCompleteCallback(loadedAssets), 0);
                }
                return this;
            }
            
            // Load each item in the queue
            loadQueue.forEach(item => {
                switch (item.type) {
                    case 'image':
                        loadImage(item.key, item.url);
                        break;
                    case 'audio':
                        loadAudio(item.key, item.url);
                        break;
                    case 'json':
                        loadJSON(item.key, item.url);
                        break;
                }
            });
            
            return this;
        },
        
        /**
         * Reset the loader, clearing all queued and loaded assets
         */
        reset: function() {
            loadQueue = [];
            loadedAssets = {
                images: {},
                audio: {},
                json: {}
            };
            totalItems = 0;
            loadedItems = 0;
            isLoading = false;
            return this;
        },
        
        /**
         * Get a loaded asset
         * @param {string} type - Asset type ('image', 'audio', 'json')
         * @param {string} key - Asset identifier
         * @return {Object} The loaded asset or null if not found
         */
        getAsset: function(type, key) {
            const assetCategory = loadedAssets[type];
            if (!assetCategory) return null;
            return assetCategory[key] || null;
        },
        
        /**
         * Check if all assets are loaded
         * @return {boolean} True if all assets are loaded
         */
        isLoadComplete: function() {
            return !isLoading && loadedItems >= totalItems;
        },
        
        /**
         * Get loading progress as a value between 0-1
         * @return {number} Loading progress (0-1)
         */
        getProgress: function() {
            return totalItems > 0 ? loadedItems / totalItems : 0;
        }
    };
})();

// Export the module
export default DataLoader; 