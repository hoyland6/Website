/**
 * Audio Module
 * Handles all music and sound effects for the game
 */

const AudioModule = (function() {
    // Private variables
    let musicTracks = {};
    let soundEffects = {};
    let currentMusic = null;
    let isMuted = false;
    let musicVolume = 0.7;
    let sfxVolume = 1.0;
    
    // Public interface
    return {
        /**
         * Initialize the audio system
         * @param {Object} config - Configuration options
         */
        init: function(config) {
            console.log('Audio module initialized');
            
            // Apply configuration if provided
            if (config) {
                if (config.musicVolume !== undefined) musicVolume = config.musicVolume;
                if (config.sfxVolume !== undefined) sfxVolume = config.sfxVolume;
                if (config.muted !== undefined) isMuted = config.muted;
            }
            
            return this;
        },
        
        /**
         * Load a music track
         * @param {string} id - Unique identifier for the track
         * @param {string} path - Path to the audio file
         * @param {Function} callback - Optional callback when loaded
         */
        loadMusic: function(id, path, callback) {
            const audio = new Audio();
            audio.src = path;
            audio.loop = true;
            
            audio.addEventListener('canplaythrough', function() {
                console.log(`Music track '${id}' loaded`);
                if (callback) callback();
            });
            
            musicTracks[id] = audio;
            return this;
        },
        
        /**
         * Load a sound effect
         * @param {string} id - Unique identifier for the sound
         * @param {string} path - Path to the audio file
         * @param {Function} callback - Optional callback when loaded
         */
        loadSound: function(id, path, callback) {
            const audio = new Audio();
            audio.src = path;
            
            audio.addEventListener('canplaythrough', function() {
                console.log(`Sound effect '${id}' loaded`);
                if (callback) callback();
            });
            
            soundEffects[id] = audio;
            return this;
        },
        
        /**
         * Play a music track
         * @param {string} id - Identifier of the track to play
         * @param {boolean} fadeIn - Whether to fade in (default: false)
         */
        playMusic: function(id, fadeIn = false) {
            if (isMuted) return this;
            
            // Stop current music if playing
            this.stopMusic();
            
            // Get the requested track
            const track = musicTracks[id];
            if (!track) {
                console.warn(`Music track '${id}' not found`);
                return this;
            }
            
            // Set volume and play
            track.volume = fadeIn ? 0 : musicVolume;
            track.play();
            currentMusic = id;
            
            // Handle fade in if requested
            if (fadeIn) {
                let vol = 0;
                const fadeInterval = setInterval(function() {
                    vol += 0.05;
                    if (vol >= musicVolume) {
                        track.volume = musicVolume;
                        clearInterval(fadeInterval);
                    } else {
                        track.volume = vol;
                    }
                }, 100);
            }
            
            return this;
        },
        
        /**
         * Stop the currently playing music
         * @param {boolean} fadeOut - Whether to fade out (default: false)
         */
        stopMusic: function(fadeOut = false) {
            if (!currentMusic) return this;
            
            const track = musicTracks[currentMusic];
            
            if (fadeOut) {
                let vol = track.volume;
                const fadeInterval = setInterval(function() {
                    vol -= 0.05;
                    if (vol <= 0) {
                        track.pause();
                        track.currentTime = 0;
                        clearInterval(fadeInterval);
                    } else {
                        track.volume = vol;
                    }
                }, 100);
            } else {
                track.pause();
                track.currentTime = 0;
            }
            
            currentMusic = null;
            return this;
        },
        
        /**
         * Play a sound effect
         * @param {string} id - Identifier of the sound to play
         */
        playSound: function(id) {
            if (isMuted) return this;
            
            const sound = soundEffects[id];
            if (!sound) {
                console.warn(`Sound effect '${id}' not found`);
                return this;
            }
            
            // Create a clone to allow overlapping sounds
            const soundClone = sound.cloneNode();
            soundClone.volume = sfxVolume;
            soundClone.play();
            
            return this;
        },
        
        /**
         * Set master volume for music
         * @param {number} volume - Volume level (0-1)
         */
        setMusicVolume: function(volume) {
            musicVolume = Math.max(0, Math.min(1, volume));
            
            // Update current track if playing
            if (currentMusic) {
                musicTracks[currentMusic].volume = musicVolume;
            }
            
            return this;
        },
        
        /**
         * Set master volume for sound effects
         * @param {number} volume - Volume level (0-1)
         */
        setSfxVolume: function(volume) {
            sfxVolume = Math.max(0, Math.min(1, volume));
            return this;
        },
        
        /**
         * Toggle mute state for all audio
         * @param {boolean} state - If provided, set mute to this state
         * @return {boolean} The new mute state
         */
        toggleMute: function(state) {
            if (state !== undefined) {
                isMuted = !!state;
            } else {
                isMuted = !isMuted;
            }
            
            // Update currently playing music
            if (currentMusic) {
                musicTracks[currentMusic].volume = isMuted ? 0 : musicVolume;
            }
            
            return isMuted;
        }
    };
})();

// Export the module
export default AudioModule; 