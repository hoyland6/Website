// Initialize variables
let scene, camera, renderer, controls;
let particles, cake, candles = [];
const particleCount = 500;
const cakeColors = {
    base: 0x3c2003, // Dark chocolate base
    frosting: 0x4a2b10, // Milk chocolate frosting
    innerCake: 0x6b4226, // Lighter chocolate for inner cake
    decorations: 0x7b3f00, // Chocolate decorations
    cream: 0xfff9e6, // Off-white cream for piping
    darkChocolate: 0x231709, // Very dark chocolate for details
    cherry: 0xff0033, // Cherry red for fruits
    green: 0x00aa44  // Green for leaf decorations
};
const candleColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff]; // Red, Green, Blue, Yellow, Purple
let birthdayTextMesh;
let nameTextMesh;
let sparkles = [];

// Start the animation immediately and load Tone.js
loadToneJs();
init();
animate();

// Load Tone.js library
function loadToneJs() {
    const toneScript = document.createElement('script');
    toneScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js';
    toneScript.onload = function() {
        initHappyBirthdaySATB();
    };
    document.head.appendChild(toneScript);
}

// Initialize and play the Happy Birthday SATB harmony using Tone.js
function initHappyBirthdaySATB() {
    // Create a button for starting audio (needed due to browser autoplay policies)
    const startButton = document.createElement('button');
    startButton.textContent = 'Play Music';
    startButton.id = 'start-audio';
    startButton.style.position = 'fixed';
    startButton.style.bottom = '20px';
    startButton.style.left = '50%';
    startButton.style.transform = 'translateX(-50%)';
    
    // Make button size responsive based on viewport width
    const updateButtonSize = () => {
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        // Base size on viewport width with minimum and maximum sizes
        const basePadding = Math.min(Math.max(vw * 0.015, 12), 25);
        const fontSize = Math.min(Math.max(vw * 0.018, 16), 28);
        
        startButton.style.padding = `${basePadding}px ${basePadding * 1.5}px`;
        startButton.style.fontSize = `${fontSize}px`;
    };
    
    // Set initial size and update on resize
    updateButtonSize();
    window.addEventListener('resize', updateButtonSize);
    
    startButton.style.backgroundColor = 'rgba(255, 204, 0, 0.8)';
    startButton.style.color = '#333';
    startButton.style.border = 'none';
    startButton.style.borderRadius = '8px'; // Slightly larger border radius
    startButton.style.cursor = 'pointer';
    startButton.style.fontFamily = 'Arial, sans-serif';
    startButton.style.fontWeight = 'bold';
    startButton.style.zIndex = '100';
    startButton.style.transition = 'opacity 0.8s ease-out, transform 0.2s ease-out';
    startButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)'; // Add subtle shadow for depth
    
    // Add hover effect
    startButton.onmouseover = function() {
        this.style.transform = 'translateX(-50%) scale(1.05)';
        this.style.backgroundColor = 'rgba(255, 204, 0, 0.9)';
    };
    
    startButton.onmouseout = function() {
        this.style.transform = 'translateX(-50%)';
        this.style.backgroundColor = 'rgba(255, 204, 0, 0.8)';
    };
    
    startButton.onclick = function() {
        if (Tone.Transport.state !== 'started') {
            // Start audio context
            Tone.start().then(() => {
                playHappyBirthdaySATB();
                // Fade out button instead of hiding it
                this.style.opacity = '0';
                // Remove from DOM after fade completes
                setTimeout(() => {
                    try {
                        document.body.removeChild(this);
                    } catch (e) {
                        // Element might already be removed
                    }
                }, 800);
            }).catch(e => {
                console.error("Error starting Tone.js:", e);
            });
        }
    };
    
    document.body.appendChild(startButton);
    
    // Also try to start on any user interaction with the page
    document.addEventListener('click', function startAudio() {
        if (Tone.Transport.state !== 'started') {
            Tone.start().then(() => {
                playHappyBirthdaySATB();
                // Fade out button
                startButton.style.opacity = '0';
                // Remove from DOM after fade completes
                setTimeout(() => {
                    try {
                        document.body.removeChild(startButton);
                    } catch (e) {
                        // Element might already be removed
                    }
                }, 800);
                document.removeEventListener('click', startAudio);
            }).catch(e => {
                console.error("Error starting Tone.js:", e);
            });
        }
    }, { once: true });
}

// Play Happy Birthday in SATB harmony
function playHappyBirthdaySATB() {
    // Create a master channel with limiter
    const masterChannel = new Tone.Channel({
        volume: -6, // Higher volume for piano
        pan: 0
    }).toDestination();
    
    // Add a limiter to prevent clipping
    const limiter = new Tone.Limiter(-1).connect(masterChannel);
    
    // Create a more realistic piano reverb
    const reverb = new Tone.Reverb({
        decay: 2.5,  // Longer decay for piano
        wet: 0.3     // Medium wetness
    }).connect(limiter);
    
    // Simpler piano implementation using PolySynth as fallback
    // This will be used if Sampler fails to load properly
    const fallbackPiano = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
            type: "sine"
        },
        envelope: {
            attack: 0.02,
            decay: 0.1,
            sustain: 0.8,
            release: 2
        }
    }).connect(reverb);
    
    // Set up the Happy Birthday song
    // Tempo - more natural piano tempo
    const tempo = 110; // Slower for more expressive piano playing
    Tone.Transport.bpm.value = tempo;
    
    // Calculate time values based on BPM
    const quarterNote = 60 / tempo;
    const eighthNote = quarterNote / 2;
    const halfNote = quarterNote * 2;
    const dottedEighthNote = eighthNote * 1.5;
    const sixteenthNote = quarterNote / 4;
    
    // Combined SATB parts in a piano arrangement
    // Each chord contains all the notes to be played at each time point
    // Format: ["bass", "tenor", "alto", "soprano"] - soprano should always be highest
    const pianoArrangement = [
        // First phrase: "Happy Birthday to you" (pickup + phrase with dotted rhythm for "Happy")
        { 
            time: 0,
            duration: dottedEighthNote,
            chord: ["G2", "B2", "D3", "G4"] // Hap- - G (tonic, root position, longer dotted note)
        },
        {
            time: dottedEighthNote,
            duration: sixteenthNote,
            chord: ["G2", "B2", "D3", "G4"] // -py - G (tonic, repeated, shorter note)
        },
        {
            time: quarterNote,
            duration: quarterNote,
            chord: ["D2", "A2", "D3", "A4"] // day - A (dominant chord in second inversion)
        },
        {
            time: quarterNote * 2,
            duration: quarterNote,
            chord: ["G2", "B2", "D3", "G4"] // to - G (return to tonic)
        },
        {
            time: quarterNote * 3,
            duration: quarterNote,
            chord: ["C2", "E3", "G3", "C5"] // you - C (subdominant, highest note)
        },
        {
            time: quarterNote * 4,
            duration: halfNote,
            chord: ["G2", "D3", "G3", "B4"] // (hold) - B (tonic chord with melodic suspension)
        },
        
        // Second phrase: "Happy Birthday to you" (with dotted rhythm for "Happy")
        {
            time: quarterNote * 6,
            duration: dottedEighthNote,
            chord: ["G2", "B2", "D3", "G4"] // Hap- - G (tonic again, longer dotted note)
        },
        {
            time: quarterNote * 6 + dottedEighthNote,
            duration: sixteenthNote,
            chord: ["G2", "B2", "D3", "G4"] // -py - G (tonic continued, shorter note)
        },
        {
            time: quarterNote * 7,
            duration: quarterNote,
            chord: ["D2", "F#2", "C3", "A4"] // day - A (dominant seventh)
        },
        {
            time: quarterNote * 8,
            duration: quarterNote,
            chord: ["G2", "B2", "D3", "G4"] // to - G (tonic return)
        },
        {
            time: quarterNote * 9,
            duration: quarterNote,
            chord: ["B1", "F#3", "D3", "D5"] // you - D (applied dominant of mediant)
        },
        {
            time: quarterNote * 10,
            duration: halfNote,
            chord: ["C2", "E3", "G3", "C5"] // (hold) - C (subdominant for cadential contrast)
        },
        
        // Third phrase: "Happy Birthday dear Lewis" (with dotted rhythm for "Happy")
        {
            time: quarterNote * 12,
            duration: dottedEighthNote,
            chord: ["G2", "B2", "D3", "G4"] // Hap- - G (returning to tonic after cadence)
        },
        {
            time: quarterNote * 12 + dottedEighthNote,
            duration: sixteenthNote,
            chord: ["G2", "B2", "D3", "G4"] // -py - G (tonic reinforcement)
        },
        {
            time: quarterNote * 13,
            duration: quarterNote,
            chord: ["E2", "B2", "E3", "G5"] // day - high G (mediant chord, dramatic high point)
        },
        {
            time: quarterNote * 14,
            duration: quarterNote,
            chord: ["C2", "G2", "C3", "E5"] // dear - E (subdominant, stepwise descent)
        },
        {
            time: quarterNote * 15,
            duration: quarterNote,
            chord: ["F2", "A2", "C3", "C5"] // Lew- - C (submediant in first inversion)
        },
        {
            time: quarterNote * 16,
            duration: quarterNote,
            chord: ["G2", "D3", "G3", "B4"] // is - B (dominant preparation)
        },
        {
            time: quarterNote * 17,
            duration: quarterNote,
            chord: ["D2", "F#2", "C3", "A4"] // - - A (dominant seventh, setting up final phrase)
        },
        
        // Fourth phrase: "Happy Birthday to you" (with dotted rhythm for "Happy")
        {
            time: quarterNote * 18,
            duration: dottedEighthNote,
            chord: ["G2", "B2", "D3", "F5"] // Hap- - high F (G major harmony supporting F melody note)
        },
        {
            time: quarterNote * 18 + dottedEighthNote,
            duration: sixteenthNote,
            chord: ["G2", "B2", "D3", "F5"] // -py - F (continuing G major harmony)
        },
        {
            time: quarterNote * 19,
            duration: quarterNote,
            chord: ["D2", "A2", "D3", "E5"] // day - E (dominant chord in second inversion as in first phrase)
        },
        {
            time: quarterNote * 20,
            duration: quarterNote,
            chord: ["G2", "B2", "D3", "C5"] // to - C (tonic harmony supporting C melody)
        },
        {
            time: quarterNote * 21,
            duration: quarterNote,
            chord: ["D2", "A2", "C3", "D5"] // you - D (dominant seventh preparing final cadence)
        },
        {
            time: quarterNote * 22,
            duration: halfNote,
            chord: ["G2", "B2", "D3", "G4"] // (hold) - G (final tonic resolution with root position chord)
        }
    ];
    
    // Calculate total song duration in seconds for looping
    const songDuration = quarterNote * 24;
    
    // Try to load piano samples with error handling and fallback
    let sampleLoadingTimeout;
    let useFallbackSynth = false;
    
    // Set a timeout to use fallback if samples don't load in time
    sampleLoadingTimeout = setTimeout(() => {
        console.warn("Piano sample loading timeout - using fallback synthesizer");
        
        // Use the fallback piano
        useFallbackSynth = true;
        
        // Schedule music with fallback piano
        scheduleChords(fallbackPiano, pianoArrangement);
        schedulePianoFlourish(fallbackPiano, quarterNote * 23);
        
        // Start the music
        Tone.Transport.start();
        
        // Set up looping - using scheduleRepeat with an exact duration ensures seamless looping
        Tone.Transport.scheduleRepeat(time => {
            // We don't need to call scheduleChords again here since the Transport handles the looping
            schedulePianoFlourish(fallbackPiano, quarterNote * 23);
        }, songDuration);
    }, 3000); // 3 second timeout for sample loading
    
    // Try to load a more reliable piano sample set
    try {
        const piano = new Tone.Sampler({
            urls: {
                C4: "C4.mp3",
                "D#4": "Ds4.mp3",
                "F#4": "Fs4.mp3",
                A4: "A4.mp3"
            },
            release: 1,
            baseUrl: "https://tonejs.github.io/audio/salamander/",
            onload: () => {
                // Clear the timeout since samples loaded successfully
                clearTimeout(sampleLoadingTimeout);
                
                // Only proceed if fallback hasn't been triggered
                if (!useFallbackSynth) {
                    console.log("Piano samples loaded successfully");
                    
                    // Schedule the piano parts - need to schedule only once for proper looping
                    scheduleChords(piano, pianoArrangement);
                    schedulePianoFlourish(piano, quarterNote * 23);
                    
                    // Start the music
                    Tone.Transport.start();
                    
                    // Set up looping with precise timings for seamless loops
                    Tone.Transport.loop = true;
                    Tone.Transport.loopEnd = songDuration;
                }
            },
            onerror: (e) => {
                console.error("Error loading piano samples:", e);
                // If there's an error, fall back to the synthesized piano
                if (!useFallbackSynth) {
                    clearTimeout(sampleLoadingTimeout);
                    
                    // Use the fallback piano
                    useFallbackSynth = true;
                    
                    // Schedule music with fallback piano - only schedule once
                    scheduleChords(fallbackPiano, pianoArrangement);
                    schedulePianoFlourish(fallbackPiano, quarterNote * 23);
                    
                    // Start the music
                    Tone.Transport.start();
                    
                    // Setup proper looping
                    Tone.Transport.loop = true;
                    Tone.Transport.loopEnd = songDuration;
                }
            }
        }).connect(reverb);
    } catch (e) {
        console.error("Error initializing sampler:", e);
        // If there's an exception, immediately use the fallback
        clearTimeout(sampleLoadingTimeout);
        
        // Use the fallback piano
        useFallbackSynth = true;
        
        // Schedule music with fallback piano - only schedule once for proper looping
        scheduleChords(fallbackPiano, pianoArrangement);
        schedulePianoFlourish(fallbackPiano, quarterNote * 23);
        
        // Start the music
        Tone.Transport.start();
        
        // Setup proper looping
        Tone.Transport.loop = true;
        Tone.Transport.loopEnd = songDuration;
    }
}

// Helper function to schedule piano chords
function scheduleChords(piano, chords, offset = 0) {
    chords.forEach(chord => {
        Tone.Transport.schedule(time => {
            try {
                // Play each note of the chord with different velocity for expression
                chord.chord.forEach((note, index) => {
                    // Soprano melody gets slightly louder velocity
                    const velocity = index === 3 ? 0.7 : 0.5;
                    piano.triggerAttackRelease(note, chord.duration, time, velocity);
                });
            } catch (e) {
                console.error("Error playing chord:", e);
            }
        }, offset + chord.time);
    });
}

// Add a little piano flourish at the end of each cycle for a more musical finish
function schedulePianoFlourish(piano, time) {
    Tone.Transport.schedule(time => {
        try {
            // Final flourish pattern - a quick arpeggio
            const notes = ["F4", "A4", "C5", "F5"];
            const velocities = [0.5, 0.6, 0.7, 0.8];
            
            notes.forEach((note, index) => {
                setTimeout(() => {
                    try {
                        piano.triggerAttackRelease(note, "16n", "+0", velocities[index]);
                    } catch (e) {
                        console.error("Error playing flourish note:", e);
                    }
                }, index * 80); // 80ms between notes
            });
        } catch (e) {
            console.error("Error scheduling flourish:", e);
        }
    }, time);
}

// Initialize the scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111133);
    
    // Create camera with responsive field of view
    const isMobile = window.innerWidth < 768;
    // Wider FOV on mobile to ensure the entire cake is visible
    const fov = isMobile ? 85 : 75;
    camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Position camera - adjust based on device
    camera.position.z = isMobile ? 20 : 18;
    camera.position.y = isMobile ? 16 : 15;
    camera.lookAt(new THREE.Vector3(0, -2, 0));
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    document.getElementById('container').appendChild(renderer.domElement);
    
    // Add orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);
    
    // Create birthday cake
    createCake();
    
    // Create candles
    createCandles();
    
    // Create birthday text instead of "19" text
    createBirthdayText();
    
    // Create confetti particles
    createParticles();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate the cake
    if (cake) {
        cake.rotation.y += 0.005;
    }
    
    // Animate the candle flames
    candles.forEach(candle => {
        if (candle.flame) {
            candle.flame.rotation.y += 0.05;
            
            // Make the flame flicker
            candle.flame.scale.x = 1 + Math.sin(Date.now() * 0.01) * 0.1;
            candle.flame.scale.z = 1 + Math.cos(Date.now() * 0.01) * 0.1;
        }
    });
    
    // Animate the birthday text
    if (birthdayTextMesh) {
        // Subtle floating animation for the birthday text
        birthdayTextMesh.position.y = 9 + Math.sin(Date.now() * 0.001) * 0.3;
    }
    
    // Animate the name text
    if (nameTextMesh) {
        // Slightly different animation pattern for the name
        nameTextMesh.position.y = 6.5 + Math.sin(Date.now() * 0.001 + 1) * 0.2;
    }
    
    // Animate sparkles
    sparkles.forEach(sparkle => {
        sparkle.position.y += 0.05;
        sparkle.rotation.y += 0.02;
        sparkle.material.opacity -= 0.005;
        
        if (sparkle.material.opacity <= 0) {
            scene.remove(sparkle);
            sparkles = sparkles.filter(s => s !== sparkle);
            
            // Add a new sparkle in a random position
            createSparkle();
        }
    });
    
    // Animate confetti particles
    if (particles) {
        const positions = particles.geometry.attributes.position.array;
        
        for (let i = 0; i < particleCount; i++) {
            const idx = i * 3;
            
            // Apply gravity and wind effect
            positions[idx + 1] -= 0.03; // Fall down with gravity
            positions[idx] += Math.sin(Date.now() * 0.001 + i) * 0.01; // Sway with the wind
            
            // If particle goes below a certain point, reset it to the top
            if (positions[idx + 1] < -10) {
                positions[idx + 1] = 20;
                positions[idx] = (Math.random() - 0.5) * 30;
                positions[idx + 2] = (Math.random() - 0.5) * 30;
            }
        }
        
        particles.geometry.attributes.position.needsUpdate = true;
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    // Check if device is mobile based on viewport width
    const isMobile = window.innerWidth < 768;
    
    // Update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    
    // Adjust field of view based on device type
    camera.fov = isMobile ? 85 : 75;
    
    // If size changes dramatically (e.g., rotation), adjust camera position
    camera.position.z = isMobile ? 20 : 18;
    camera.position.y = isMobile ? 16 : 15;
    
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Create the birthday cake
function createCake() {
    cake = new THREE.Group();
    
    // Create a tall chocolate cake (single large layer)
    const cakeRadius = 5.5;
    const cakeHeight = 6.0; // Much taller cake
    
    // Main cake body
    const cakeGeometry = new THREE.CylinderGeometry(cakeRadius, cakeRadius, cakeHeight, 32);
    const cakeMaterial = new THREE.MeshPhongMaterial({ 
        color: cakeColors.base,
        shininess: 20
    });
    const cakeBody = new THREE.Mesh(cakeGeometry, cakeMaterial);
    cakeBody.position.y = cakeHeight/2;
    cake.add(cakeBody);
    
    // Frost the top of the cake
    const frostingGeometry = new THREE.CylinderGeometry(cakeRadius, cakeRadius, 0.4, 32);
    const frostingMaterial = new THREE.MeshPhongMaterial({ 
        color: cakeColors.frosting,
        shininess: 60
    });
    const frosting = new THREE.Mesh(frostingGeometry, frostingMaterial);
    frosting.position.y = cakeHeight + 0.2;
    cake.add(frosting);
    
    // Add frosting around the sides (slightly larger radius)
    const sideFrostingGeometry = new THREE.CylinderGeometry(cakeRadius + 0.2, cakeRadius + 0.2, cakeHeight + 0.4, 32);
    sideFrostingGeometry.translate(0, (cakeHeight/2) - 0.2, 0); // Position to cover the cake sides
    
    // Create a wireframe material to serve as the pattern for the chocolate frosting
    const wireframeMaterial = new THREE.MeshBasicMaterial({ 
        color: cakeColors.darkChocolate, 
        wireframe: true,
        wireframeLinewidth: 2,
        opacity: 0.7,
        transparent: true
    });
    
    const sideFrosting = new THREE.Mesh(sideFrostingGeometry, frostingMaterial);
    cake.add(sideFrosting);
    
    // Create a textured look for the frosting with a wireframe overlay
    const textureOverlay = new THREE.Mesh(sideFrostingGeometry, wireframeMaterial);
    textureOverlay.scale.set(1.01, 1, 1.01); // Slightly larger to prevent z-fighting
    cake.add(textureOverlay);
    
    // Add chocolate drips down the sides
    createChocolateDrips(cakeHeight);
    
    // Add chocolate chunks on top
    for (let i = 0; i < 15; i++) {
        createChocolateChunk(
            (Math.random() - 0.5) * (cakeRadius * 1.5),
            cakeHeight + 0.5,
            (Math.random() - 0.5) * (cakeRadius * 1.5),
            Math.random() * 0.3 + 0.2,
            cakeColors.darkChocolate
        );
    }
    
    // Add cherries on top
    for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const radius = cakeRadius * 0.7;
        
        createCherry(
            Math.cos(angle) * radius,
            cakeHeight + 0.6, // Above the frosting
            Math.sin(angle) * radius
        );
    }
    
    // Add two chocolate rings on top for decoration
    createChocolateRing(0, cakeHeight + 0.45, 0, cakeRadius * 0.7, cakeColors.darkChocolate);
    createChocolateRing(0, cakeHeight + 0.45, 0, cakeRadius * 0.4, cakeColors.darkChocolate);
    
    // Add horizontal chocolate layers for a layered cake effect
    addHorizontalChocolateLayers(cakeHeight, cakeRadius);
    
    // Add candle positions on top
    createCandlePositions(cakeHeight);
    
    // Add the cake to the scene
    scene.add(cake);
    cake.position.y = -4; // Position the cake lower in the scene
}

// Create the positioning for candles on top of the chocolate cake
function createCandlePositions(cakeHeight) {
    // Save the cake height for proper candle placement
    const cakeTopY = cakeHeight + 0.4;
    
    // Rearrange candles for tall chocolate cake
    // Outer circle of candles
    const outerCount = 15;
    const outerRadius = 4.5;
    
    // Inner cluster of candles
    const innerCount = 4;
    const innerRadius = 2;
    
    // Create outer circle of candles
    for (let i = 0; i < outerCount; i++) {
        const angle = (i / outerCount) * Math.PI * 2;
        const x = Math.cos(angle) * outerRadius;
        const z = Math.sin(angle) * outerRadius;
        
        createCandle(x, cakeTopY, z, i);
    }
    
    // Create inner cluster of candles in a scattered pattern
    for (let i = 0; i < innerCount; i++) {
        const angle = (i / innerCount) * Math.PI * 2;
        // Add some randomness to the inner circle
        const randOffset = Math.random() * 0.5;
        const x = Math.cos(angle) * (innerRadius + randOffset);
        const z = Math.sin(angle) * (innerRadius + randOffset);
        
        createCandle(x, cakeTopY, z, i + outerCount);
    }
}

// Add horizontal chocolate layers to create a layered cake effect
function addHorizontalChocolateLayers(cakeHeight, cakeRadius) {
    // Add chocolate layers at different heights
    const numberOfLayers = 4;
    const layerThickness = 0.15;
    
    for (let i = 1; i < numberOfLayers; i++) {
        const layerHeight = (cakeHeight / numberOfLayers) * i;
        
        // Create a thin disk for each layer
        const layerGeometry = new THREE.CylinderGeometry(cakeRadius + 0.25, cakeRadius + 0.25, layerThickness, 32);
        const layerMaterial = new THREE.MeshPhongMaterial({ 
            color: cakeColors.darkChocolate,
            shininess: 80
        });
        
        const layer = new THREE.Mesh(layerGeometry, layerMaterial);
        layer.position.y = layerHeight;
        cake.add(layer);
        
        // Add some chocolate drips from each layer
        for (let j = 0; j < 8; j++) {
            const angle = (j / 8) * Math.PI * 2 + (i * 0.2); // Offset each layer's drips
            createSmallDrip(angle, layerHeight, cakeRadius);
        }
    }
}

// Create smaller chocolate drips for the layer effects
function createSmallDrip(angle, yPos, radius) {
    const x = Math.cos(angle) * (radius + 0.2);
    const z = Math.sin(angle) * (radius + 0.2);
    
    // Create a smaller drip
    const length = Math.random() * 0.5 + 0.3;
    
    const dripGeometry = new THREE.CylinderGeometry(0.08, 0.15, length, 8);
    const dripMaterial = new THREE.MeshPhongMaterial({ 
        color: cakeColors.darkChocolate,
        shininess: 100
    });
    
    const drip = new THREE.Mesh(dripGeometry, dripMaterial);
    drip.position.set(x, yPos - length/2, z);
    
    // Add a small drop at the bottom
    const dropGeometry = new THREE.SphereGeometry(0.12, 8, 8);
    const drop = new THREE.Mesh(dropGeometry, dripMaterial);
    drop.position.y = -length/2;
    drip.add(drop);
    
    cake.add(drip);
}

// Modified chocolate drips for the new cake shape
function createChocolateDrips(cakeHeight) {
    // Create drips all around the edge at the top
    for (let i = 0; i < 25; i++) {
        const angle = (i / 25) * Math.PI * 2;
        createDrip(angle, cakeHeight, 5.7, 5.7, cakeColors.darkChocolate);
    }
}

// Create a chocolate chunk
function createChocolateChunk(x, y, z, size, color) {
    // Create an irregular shape for the chocolate chunk
    const geometry = new THREE.BoxGeometry(size, size * 0.5, size);
    
    // Apply some random rotation to make it look irregular
    geometry.rotateX(Math.random() * Math.PI);
    geometry.rotateZ(Math.random() * Math.PI);
    
    const material = new THREE.MeshPhongMaterial({ 
        color: color,
        shininess: 70
    });
    
    const chunk = new THREE.Mesh(geometry, material);
    chunk.position.set(x, y, z);
    
    cake.add(chunk);
}

// Create a chocolate ring on top
function createChocolateRing(x, y, z, radius, color) {
    const ringGeometry = new THREE.TorusGeometry(radius, 0.3, 16, 32);
    const ringMaterial = new THREE.MeshPhongMaterial({ 
        color: color,
        shininess: 80
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.set(x, y, z);
    ring.rotation.x = Math.PI/2; // Rotate to lay flat
    
    cake.add(ring);
}

// Helper function to create a single candle
function createCandle(x, y, z, index) {
    const candle = new THREE.Group();
    
    // Create candle body
    const candleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 16);
    const candleMaterial = new THREE.MeshPhongMaterial({ 
        color: candleColors[index % candleColors.length] 
    });
    const candleBody = new THREE.Mesh(candleGeometry, candleMaterial);
    candleBody.position.y = 0.5; // Position the body with half height above the base
    candle.add(candleBody);
    
    // Create candle flame
    const flameGeometry = new THREE.ConeGeometry(0.15, 0.4, 16);
    const flameMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffff00,
        emissive: 0xffcc00,
        emissiveIntensity: 2
    });
    const flame = new THREE.Mesh(flameGeometry, flameMaterial);
    flame.position.y = 1.2; // Position the flame at the top of the candle
    candle.add(flame);
    candle.flame = flame; // Store reference for animation
    
    // Position candle
    candle.position.set(x, y, z);
    
    // Add candle to the cake
    cake.add(candle);
    candles.push(candle);
}

// Create Birthday text instead of "19" text
function createBirthdayText() {
    // Using the non-module version of FontLoader
    const loader = new THREE.FontLoader();
    
    // Use the built-in font
    loader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', function(font) {
        // Create "Happy 19th Birthday" text
        const birthdayTextGeometry = new THREE.TextGeometry('Happy 19th Birthday', {
            font: font,
            size: 1.2,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.03,
            bevelSegments: 5
        });
        
        // Center the text
        birthdayTextGeometry.computeBoundingBox();
        const birthdayTextWidth = birthdayTextGeometry.boundingBox.max.x - birthdayTextGeometry.boundingBox.min.x;
        
        // Center the geometry itself
        birthdayTextGeometry.translate(-birthdayTextWidth / 2, 0, 0);
        
        const textMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffcc00,
            specular: 0xffffff,
            shininess: 100
        });
        
        birthdayTextMesh = new THREE.Mesh(birthdayTextGeometry, textMaterial);
        
        // Position the text higher above the cake
        birthdayTextMesh.position.set(0, 9, 0);
        
        scene.add(birthdayTextMesh);
        
        // Create "Lewis Cobb" name text below the birthday text
        const nameTextGeometry = new THREE.TextGeometry('Lewis Cobb', {
            font: font,
            size: 1.3, // Increased size from 1.0 to 1.3
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.03,
            bevelSegments: 5
        });
        
        // Center the text
        nameTextGeometry.computeBoundingBox();
        const nameTextWidth = nameTextGeometry.boundingBox.max.x - nameTextGeometry.boundingBox.min.x;
        
        // Center the geometry itself
        nameTextGeometry.translate(-nameTextWidth / 2, 0, 0);
        
        const nameMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff6600, // Different color for name
            specular: 0xffffff,
            shininess: 100
        });
        
        nameTextMesh = new THREE.Mesh(nameTextGeometry, nameMaterial);
        
        // Position the name text below the birthday text with less vertical space
        nameTextMesh.position.set(0, 6.5, 0); // Changed from 7 to 6.5 to create moderate separation
        
        scene.add(nameTextMesh);
        
        // Create sparkles around both texts
        for (let i = 0; i < 40; i++) {
            createSparkle();
        }
    });
}

// Create a single sparkle
function createSparkle() {
    const sparkleGeometry = new THREE.OctahedronGeometry(0.2, 0);
    const sparkleMaterial = new THREE.MeshPhongMaterial({
        color: Math.random() > 0.5 ? 0xffcc00 : 0xff6600,
        emissive: 0xffff00,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 1
    });
    
    const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
    
    // Position randomly around the birthday text
    sparkle.position.x = (Math.random() - 0.5) * 10; // Wider area
    sparkle.position.y = 7 + (Math.random() - 0.5) * 3; // Area covering both texts
    sparkle.position.z = (Math.random() - 0.5) * 3;
    
    scene.add(sparkle);
    sparkles.push(sparkle);
    
    return sparkle;
}

// Create confetti particles
function createParticles() {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const color = new THREE.Color();
    
    for (let i = 0; i < particleCount; i++) {
        // Position
        positions[i * 3] = (Math.random() - 0.5) * 30; // x
        positions[i * 3 + 1] = Math.random() * 30; // y
        positions[i * 3 + 2] = (Math.random() - 0.5) * 30; // z
        
        // Color - choose from birthday colors
        const colorIndex = Math.floor(Math.random() * 4);
        if (colorIndex === 0) color.setHex(0xff6600);      // Orange
        else if (colorIndex === 1) color.setHex(0xffcc00); // Gold
        else if (colorIndex === 2) color.setHex(0xff0000); // Red
        else color.setHex(0x00ccff);                      // Blue
        
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        
        // Size
        sizes[i] = Math.random() * 0.5 + 0.1;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.4,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });
    
    particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);
}

// Create birthday candles 
function createCandles() {
    // We now delegate the positioning logic to createCandlePositions
    // which gets called from createCake with the proper cake height
}

// Create a cherry with stem
function createCherry(x, y, z) {
    // Create cherry body
    const cherryGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const cherryMaterial = new THREE.MeshPhongMaterial({ 
        color: cakeColors.cherry,
        shininess: 100
    });
    
    const cherry = new THREE.Mesh(cherryGeometry, cherryMaterial);
    cherry.position.set(x, y, z);
    
    // Create a stem
    const stemGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
    const stemMaterial = new THREE.MeshPhongMaterial({ 
        color: cakeColors.green,
        shininess: 30
    });
    
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.3;
    // Bend the stem slightly
    stem.rotation.x = Math.random() * 0.5;
    stem.rotation.z = Math.random() * 0.5;
    
    cherry.add(stem);
    
    // Add a small leaf
    const leafGeometry = new THREE.BoxGeometry(0.2, 0.02, 0.1);
    const leafMaterial = new THREE.MeshPhongMaterial({ 
        color: cakeColors.green,
        shininess: 30
    });
    
    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
    leaf.position.set(0, 0.3, 0.1);
    leaf.rotation.x = Math.PI/4;
    stem.add(leaf);
    
    cake.add(cherry);
}

// Create a chocolate drip
function createDrip(angle, yPos, topRadius, bottomRadius, color) {
    const x = Math.cos(angle) * (topRadius + 0.1); // Slightly outside the cake
    const z = Math.sin(angle) * (topRadius + 0.1);
    
    // Create the drip shape
    const length = Math.random() * 0.8 + 0.4; // Random length between 0.4 and 1.2
    
    const dripGeometry = new THREE.CylinderGeometry(0.1, 0.2, length, 8);
    const dripMaterial = new THREE.MeshPhongMaterial({ 
        color: color,
        shininess: 100
    });
    
    const drip = new THREE.Mesh(dripGeometry, dripMaterial);
    drip.position.set(x, yPos - length/2, z);
    
    // Add a small sphere at the bottom of the drip
    const dropGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const drop = new THREE.Mesh(dropGeometry, dripMaterial);
    drop.position.y = -length/2;
    drip.add(drop);
    
    cake.add(drip);
}