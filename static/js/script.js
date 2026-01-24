document.addEventListener("DOMContentLoaded", function () {
  console.log("Script loaded and DOM ready!"); // Debug

  // ===== Background Music Player =====
  const backgroundMusic = document.getElementById("backgroundMusic");
  const musicToggleBtn = document.getElementById("musicToggleBtn");
  const volumeSlider = document.getElementById("musicVolumeSlider");
  const volumeValue = document.getElementById("volumeValue");
  const playIcon = musicToggleBtn?.querySelector(".music-icon-play");
  const pauseIcon = musicToggleBtn?.querySelector(".music-icon-pause");
  const muteIcon = musicToggleBtn?.querySelector(".music-icon-muted");

  // Set default volume to 30%
  if (backgroundMusic) {
    backgroundMusic.volume = 0.3;
  }
  if (volumeSlider) {
    volumeSlider.value = 30;
  }
  if (volumeValue) {
    volumeValue.textContent = "30%";
  }

  // Track if music has been started by user interaction
  let musicStarted = false;
  let isPlaying = false;
  let isPlayingPromise = false; // Flag to prevent pause during play promise

  // Function to update button icons based on state
  function updateButtonIcons() {
    if (!musicToggleBtn) return;
    
    const volume = volumeSlider ? parseInt(volumeSlider.value) : 30;
    
    // Show mute icon only when volume is 0%
    if (volume === 0) {
      if (playIcon) playIcon.style.display = "none";
      if (pauseIcon) pauseIcon.style.display = "none";
      if (muteIcon) muteIcon.style.display = "block";
      musicToggleBtn.classList.remove("active");
    } else {
      // Show play or pause icon based on playing state
      if (muteIcon) muteIcon.style.display = "none";
      if (isPlaying) {
        if (playIcon) playIcon.style.display = "none";
        if (pauseIcon) pauseIcon.style.display = "block";
        musicToggleBtn.classList.add("active");
      } else {
        if (playIcon) playIcon.style.display = "block";
        if (pauseIcon) pauseIcon.style.display = "none";
        musicToggleBtn.classList.remove("active");
      }
    }
  }

  // Update volume when slider changes
  if (volumeSlider && backgroundMusic) {
    volumeSlider.addEventListener("input", function (e) {
      const volume = parseInt(e.target.value) / 100;
      backgroundMusic.volume = volume;
      if (volumeValue) {
        volumeValue.textContent = `${e.target.value}%`;
      }
      
      // Update icons based on volume
      updateButtonIcons();
      
      // If volume is set to 0, pause the music
      if (volume === 0 && !backgroundMusic.paused) {
        backgroundMusic.pause();
        isPlaying = false;
        updateButtonIcons();
      }
    });
  }

  // Toggle music play/pause
  if (musicToggleBtn && backgroundMusic) {
    musicToggleBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();
      
      // Don't allow actions if a play promise is in progress
      if (isPlayingPromise) {
        console.log("Play promise in progress, ignoring click");
        return;
      }
      
      const volume = volumeSlider ? parseInt(volumeSlider.value) : 30;
      
      // Don't allow play if volume is 0
      if (volume === 0) {
        return;
      }
      
      if (backgroundMusic.paused) {
        // User interaction - safe to play
        // Set volume before playing
        backgroundMusic.volume = volume / 100;
        
        // Ensure audio is loaded - check readyState
        console.log("Audio readyState before play:", backgroundMusic.readyState);
        if (backgroundMusic.readyState < 2) {
          console.log("Audio not ready, calling load()...");
          backgroundMusic.load();
          // Wait a bit for load to start
          setTimeout(() => {
            console.log("Audio readyState after load:", backgroundMusic.readyState);
          }, 100);
        }
        
        // Set flag to prevent pause during play promise
        isPlayingPromise = true;
        
        // Wait for audio to be ready if it's still loading
        const tryPlay = () => {
          if (backgroundMusic.readyState >= 2) {
            // Audio has enough data to play
            const playPromise = backgroundMusic.play();
            
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  musicStarted = true;
                  isPlaying = true;
                  isPlayingPromise = false; // Clear flag after successful play
                  updateButtonIcons();
                  console.log("Music playing successfully");
                })
                .catch(err => {
                  isPlayingPromise = false; // Clear flag on error
                  // Log all errors for debugging
                  console.error("Play failed:", err.name, err.message);
                  if (err.name !== 'AbortError') {
                    // Try to reload and play again
                    console.log("Attempting to reload audio...");
                    backgroundMusic.load();
                    setTimeout(() => {
                      if (backgroundMusic.readyState >= 2) {
                        isPlayingPromise = true;
                        backgroundMusic.play()
                          .then(() => {
                            musicStarted = true;
                            isPlaying = true;
                            isPlayingPromise = false;
                            updateButtonIcons();
                            console.log("Music playing after reload");
                          })
                          .catch(err2 => {
                            isPlayingPromise = false;
                            console.error("Play failed after reload:", err2);
                            isPlaying = false;
                            updateButtonIcons();
                          });
                      } else {
                        console.error("Audio still not ready after reload");
                        isPlayingPromise = false;
                        isPlaying = false;
                        updateButtonIcons();
                      }
                    }, 500);
                  } else {
                    isPlaying = false;
                    updateButtonIcons();
                  }
                });
            } else {
              // Fallback if play() doesn't return a promise
              isPlayingPromise = false;
              musicStarted = true;
              isPlaying = true;
              updateButtonIcons();
            }
          } else {
            // Audio not ready yet, wait a bit and try again
            console.log("Audio not ready, waiting... readyState:", backgroundMusic.readyState);
            setTimeout(() => {
              if (backgroundMusic.readyState >= 2) {
                tryPlay();
              } else {
                console.error("Audio failed to load after waiting");
                isPlayingPromise = false;
                isPlaying = false;
                updateButtonIcons();
              }
            }, 200);
          }
        };
        
        tryPlay();
      } else {
        // Only pause if not in the middle of a play promise
        if (!isPlayingPromise) {
          backgroundMusic.pause();
          isPlaying = false;
          updateButtonIcons();
          console.log("Music paused");
        }
      }
    });
  }

  // Handle audio loading errors
  if (backgroundMusic) {
    backgroundMusic.addEventListener("error", function (e) {
      console.error("Audio loading error:", e);
      console.error("Audio error details:", backgroundMusic.error);
      // Hide music controls if audio file doesn't exist
      if (musicToggleBtn) {
        musicToggleBtn.style.display = "none";
      }
      if (volumeSlider && volumeSlider.parentElement) {
        volumeSlider.parentElement.style.display = "none";
      }
    });

    // Listen for play/pause events to keep state in sync
    backgroundMusic.addEventListener("play", function () {
      isPlaying = true;
      isPlayingPromise = false; // Clear flag when play event fires
      updateButtonIcons();
      console.log("Audio play event fired");
    });

    backgroundMusic.addEventListener("pause", function () {
      // Only update if not in the middle of a play promise
      if (!isPlayingPromise) {
        isPlaying = false;
        updateButtonIcons();
        console.log("Audio pause event fired");
      } else {
        console.log("Pause event ignored - play promise in progress");
      }
    });

    backgroundMusic.addEventListener("loadeddata", function () {
      console.log("Audio loaded, ready state:", backgroundMusic.readyState);
      // Set initial volume
      backgroundMusic.volume = 0.3;
    });

    backgroundMusic.addEventListener("canplay", function () {
      console.log("Audio can play");
    });

    backgroundMusic.addEventListener("canplaythrough", function () {
      console.log("Audio can play through");
    });

    // Don't attempt autoplay - wait for user interaction
    // Set initial state to paused (play icon visible)
    isPlaying = false;
    updateButtonIcons();
    
    // Log initial state
    console.log("Music player initialized. Audio element:", backgroundMusic);
    console.log("Audio src:", backgroundMusic.src || backgroundMusic.querySelector("source")?.src);
  }
  
  // ===== Workspace Images - Get references once =====
  const workspaceImage1 = document.querySelector(".workspace-image-1");
  const workspaceImage2 = document.querySelector(".workspace-image-2");
  const workspaceImage3 = document.querySelector(".workspace-image-3");
  const workspaceImage4 = document.querySelector(".workspace-image-4");
  const workspaceOverlay = document.querySelector(".workspace-overlay");
  
  // Ensure images are initialized with opacity
  if (workspaceImage1) workspaceImage1.style.opacity = "1";
  if (workspaceImage2) workspaceImage2.style.opacity = "0";
  if (workspaceImage3) workspaceImage3.style.opacity = "0";
  if (workspaceImage4) workspaceImage4.style.opacity = "0";
  
  // Track person zone (screen) state - cycles: 1 → 4 → 3 → 4 → 3 → 4...
  let screenClickState = 0; // 0 = image1, 1 = image4, 2 = image3, then toggles between 3 and 4
  let screenToggleMode = false; // true when toggling between 3 and 4
  
  // Track workspace4 zone (chair) state
  let chairZoneActive = false;
  let previousImageBeforeChair = 1; // Track which image (1 or 2) was showing before chair click
  
  // ===== Lamp references (needed for deactivation) =====
  const lampRight = document.getElementById("lampRight");
  const lampHintRight = document.getElementById("lampHintRight");
  let lampRightLit = false;
  
 // Debug
 // Debug
  
  // ===== Person Zone Click (Screen) - Cycles: 1 → 4 → 3 → 1 =====
  const personZone = document.getElementById("personZone");
  
  console.log("Person Zone found:", personZone); // Debug
  console.log("Workspace images found:", {
    img1: workspaceImage1,
    img2: workspaceImage2,
    img3: workspaceImage3,
    img4: workspaceImage4
  }); // Debug
  
  if (personZone) {
    personZone.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Screen clicked!"); // Debug log
      
      if (workspaceImage1 && workspaceImage2 && workspaceImage3 && workspaceImage4) {
        // Reset all images
        workspaceImage1.style.opacity = "0";
        workspaceImage2.style.opacity = "0";
        workspaceImage3.style.opacity = "0";
        workspaceImage4.style.opacity = "0";
        
        if (!screenToggleMode) {
          // Initial sequence: 1 → 4 → 3, then switch to toggle mode
          screenClickState = screenClickState + 1;
          
          if (screenClickState === 1) {
            // First click: Image 1 → Image 4 (switching on)
            workspaceImage4.style.opacity = "1";
            playScreenSwitchOnSound();
          } else if (screenClickState === 2) {
            // Second click: Image 4 → Image 3 (switching off)
            workspaceImage3.style.opacity = "1";
            screenToggleMode = true; // Enter toggle mode
            screenClickState = 3; // Set to image 3 state
            playScreenSwitchOffSound();
          }
        } else {
          // Toggle mode: Switch between Image 3 and Image 4
          if (screenClickState === 3) {
            // Currently showing 3, switch to 4 (switching on)
            workspaceImage4.style.opacity = "1";
            screenClickState = 4;
            playScreenSwitchOnSound();
          } else {
            // Currently showing 4, switch to 3 (switching off)
            workspaceImage3.style.opacity = "1";
            screenClickState = 3;
            playScreenSwitchOffSound();
          }
        }
        
        // Deactivate other zones
        chairZoneActive = false;
        if (lampRight) {
          lampRightLit = false;
          lampRight.classList.remove("lit");
          if (lampHintRight) lampHintRight.classList.remove("hidden");
        }
        if (workspaceOverlay) workspaceOverlay.classList.remove("lit");
      }
    });
    
    // Add visual feedback
    personZone.addEventListener("mousedown", function() {
      this.style.transform = "scale(0.95)";
    });
    
    personZone.addEventListener("mouseup", function() {
      this.style.transform = "scale(1.05)";
    });
  }

  // ===== Workspace4 Zone Click (Chair) - Toggle workspace-3.jpg =====
  const workspace4Zone = document.getElementById("workspace4Zone");
  
 // Debug
  
  if (workspace4Zone) {
    workspace4Zone.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Chair clicked!"); // Debug log
      
      if (workspaceImage1 && workspaceImage2 && workspaceImage3 && workspaceImage4) {
        // Check which image is currently showing
        const image1Visible = workspaceImage1.style.opacity === "1" || getComputedStyle(workspaceImage1).opacity === "1";
        const image2Visible = workspaceImage2.style.opacity === "1" || getComputedStyle(workspaceImage2).opacity === "1";
        const image3Visible = workspaceImage3.style.opacity === "1" || getComputedStyle(workspaceImage3).opacity === "1";
        const image4Visible = workspaceImage4.style.opacity === "1" || getComputedStyle(workspaceImage4).opacity === "1";
        
        if (image3Visible) {
          // If image 3 is already displayed, switch to image 4
          workspaceImage1.style.opacity = "0";
          workspaceImage2.style.opacity = "0";
          workspaceImage3.style.opacity = "0";
          workspaceImage4.style.opacity = "1";
          chairZoneActive = true;
          playSitDownSound();
        } else if (image4Visible) {
          // If image 4 is displayed, switch back to previous image (image 1 or 2)
          workspaceImage1.style.opacity = previousImageBeforeChair === 1 ? "1" : "0";
          workspaceImage2.style.opacity = previousImageBeforeChair === 2 ? "1" : "0";
          workspaceImage3.style.opacity = "0";
          workspaceImage4.style.opacity = "0";
          chairZoneActive = false;
          playSitUpSound();
        } else {
          // If image 1 or 2 is showing, switch to image 3
          // Save which image was showing (1 or 2)
          if (image1Visible) {
            previousImageBeforeChair = 1;
          } else if (image2Visible) {
            previousImageBeforeChair = 2;
          } else {
            // Default to image 1 if neither is visible
            previousImageBeforeChair = 1;
          }
          
          // Switch to workspace-3.jpg - Sit down
          workspaceImage1.style.opacity = "0";
          workspaceImage2.style.opacity = "0";
          workspaceImage3.style.opacity = "1";
          workspaceImage4.style.opacity = "0";
          chairZoneActive = true;
          playSitDownSound();
        }
        
        // Deactivate other zones
        screenClickState = 0; // Reset screen state
        screenToggleMode = false; // Reset toggle mode
        if (lampRight) {
          lampRightLit = false;
          lampRight.classList.remove("lit");
          if (lampHintRight) lampHintRight.classList.remove("hidden");
        }
        if (workspaceOverlay) workspaceOverlay.classList.remove("lit");
      }
    });
    
    // Add visual feedback
    workspace4Zone.addEventListener("mousedown", function() {
      this.style.transform = "scale(0.95)";
    });
    
    workspace4Zone.addEventListener("mouseup", function() {
      this.style.transform = "scale(1.05)";
    });
  }

  // ===== Screen Background Click - Removed (now handled by person zone) =====
  // The screen click functionality is now handled by the person zone button

  // ===== Lamp Interaction =====
  // Function to handle lamp toggle
  function toggleLamp() {
    lampRightLit = !lampRightLit;
    
    if (lampRightLit) {
      lampRight.classList.add("lit");
      if (lampHintRight) lampHintRight.classList.add("hidden");
      playLampSwitchSound();
    } else {
      lampRight.classList.remove("lit");
      if (lampHintRight) lampHintRight.classList.remove("hidden");
      playLampSwitchSound();
    }
    updateWorkspaceLighting();
  }
  
  // Right Lamp - Zone click
  if (lampRight) {
    lampRight.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Lamp zone clicked!"); // Debug log
      toggleLamp();
    });
  }
  
  // Lamp Hint Text - Also clickable
  if (lampHintRight) {
    lampHintRight.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Lamp hint clicked!"); // Debug log
      toggleLamp();
    });
    
    // Make hint arrow clickable too
    const hintArrow = lampHintRight.querySelector(".hint-arrow");
    if (hintArrow) {
      hintArrow.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("Lamp arrow clicked!"); // Debug log
        toggleLamp();
      });
    }
  }

  // Update overall workspace lighting and image
  function updateWorkspaceLighting() {
    const anyLampLit = lampRightLit;
    
    // Update overlay brightness
    if (workspaceOverlay) {
      if (anyLampLit) {
        workspaceOverlay.classList.add("lit");
      } else {
        workspaceOverlay.classList.remove("lit");
      }
    }
    
    // Switch workspace image based on lamp state
    // Lamp: image 1 ↔ image 2 (always alternates between these two)
    if (workspaceImage1 && workspaceImage2 && workspaceImage3 && workspaceImage4) {
      // Reset all images first
      workspaceImage1.style.opacity = "0";
      workspaceImage2.style.opacity = "0";
      workspaceImage3.style.opacity = "0";
      workspaceImage4.style.opacity = "0";
      
      if (anyLampLit) {
        // Lamp is ON: Show image 2
        workspaceImage2.style.opacity = "1";
      } else {
        // Lamp is OFF: Show image 1
        workspaceImage1.style.opacity = "1";
      }
      
      // Deactivate other zones
      chairZoneActive = false;
      screenClickState = 0; // Reset screen state
      screenToggleMode = false; // Reset toggle mode
    }
  }

  // Lamp switch sound effect - using custom audio file
  let lampClickAudio = null;
  
  // Screen switch sound effects - using custom audio files
  let screenSwitchOnAudio = null;
  let screenSwitchOffAudio = null;
  
  // Chair (sit down/up) sound effects - using custom audio files
  let sitDownAudio = null;
  let sitUpAudio = null;
  
  // Preload the audio file
  function preloadLampSound() {
    try {
      // Get static URL (from Flask or use default)
      const staticUrl = window.STATIC_URL || '/static/';
      const audioPath = `${staticUrl}sounds/lamp-click`;
      const extensions = ['mp3', 'wav', 'ogg'];
      
      // Try to find the audio file
      for (const ext of extensions) {
        const audio = new Audio(`${audioPath}.${ext}`);
        audio.addEventListener('canplaythrough', function() {
          if (!lampClickAudio) {
            lampClickAudio = audio;
            lampClickAudio.volume = 0.7; // Set volume (0.0 to 1.0)
          }
        }, { once: true });
        audio.addEventListener('error', function() {
          // Try next format
        }, { once: true });
        audio.load();
      }
    } catch (e) {
      console.log("Audio file not found or not supported");
    }
  }
  
  function playLampSwitchSound() {
    try {
      if (lampClickAudio) {
        // Reset to beginning and play
        lampClickAudio.currentTime = 0;
        lampClickAudio.play().catch(e => {
          console.log("Could not play audio:", e);
        });
      } else {
        // Fallback: try common formats
        const staticUrl = window.STATIC_URL || '/static/';
        const formats = ['mp3', 'wav', 'ogg'];
        for (const format of formats) {
          const audio = new Audio(`${staticUrl}sounds/lamp-click.${format}`);
          audio.volume = 0.7;
          audio.play().catch(e => {
            // Try next format
          });
          break; // Stop after first successful attempt
        }
      }
    } catch (e) {
      console.log("Audio playback error:", e);
    }
  }
  
  // Preload sound on page load
  preloadLampSound();
  preloadScreenSounds();
  preloadChairSounds();
  
  // Preload screen switch sounds
  function preloadScreenSounds() {
    try {
      const staticUrl = window.STATIC_URL || '/static/';
      const extensions = ['mp3', 'wav', 'ogg'];
      
      // Try to find the switch-on audio file
      for (const ext of extensions) {
        const audioOn = new Audio(`${staticUrl}sounds/screen-switch-on.${ext}`);
        audioOn.addEventListener('canplaythrough', function() {
          if (!screenSwitchOnAudio) {
            screenSwitchOnAudio = audioOn;
            screenSwitchOnAudio.volume = 0.7;
          }
        }, { once: true });
        audioOn.addEventListener('error', function() {
          // Try next format
        }, { once: true });
        audioOn.load();
      }
      
      // Try to find the switch-off audio file
      for (const ext of extensions) {
        const audioOff = new Audio(`${staticUrl}sounds/screen-switch-off.${ext}`);
        audioOff.addEventListener('canplaythrough', function() {
          if (!screenSwitchOffAudio) {
            screenSwitchOffAudio = audioOff;
            screenSwitchOffAudio.volume = 0.7;
          }
        }, { once: true });
        audioOff.addEventListener('error', function() {
          // Try next format
        }, { once: true });
        audioOff.load();
      }
    } catch (e) {
      console.log("Screen sound files not found or not supported");
    }
  }
  
  function playScreenSwitchOnSound() {
    try {
      if (screenSwitchOnAudio) {
        screenSwitchOnAudio.currentTime = 0;
        screenSwitchOnAudio.play().catch(e => {
          console.log("Could not play switch-on audio:", e);
        });
      } else {
        // Fallback: try common formats
        const staticUrl = window.STATIC_URL || '/static/';
        const formats = ['mp3', 'wav', 'ogg'];
        for (const format of formats) {
          const audio = new Audio(`${staticUrl}sounds/screen-switch-on.${format}`);
          audio.volume = 0.7;
          audio.play().catch(e => {
            // Try next format
          });
          break;
        }
      }
    } catch (e) {
      console.log("Screen switch-on audio playback error:", e);
    }
  }
  
  function playScreenSwitchOffSound() {
    try {
      if (screenSwitchOffAudio) {
        screenSwitchOffAudio.currentTime = 0;
        screenSwitchOffAudio.play().catch(e => {
          console.log("Could not play switch-off audio:", e);
        });
      } else {
        // Fallback: try common formats
        const staticUrl = window.STATIC_URL || '/static/';
        const formats = ['mp3', 'wav', 'ogg'];
        for (const format of formats) {
          const audio = new Audio(`${staticUrl}sounds/screen-switch-off.${format}`);
          audio.volume = 0.7;
          audio.play().catch(e => {
            // Try next format
          });
          break;
        }
      }
    } catch (e) {
      console.log("Screen switch-off audio playback error:", e);
    }
  }
  
  // Preload chair (sit down/up) sounds
  function preloadChairSounds() {
    try {
      const staticUrl = window.STATIC_URL || '/static/';
      const extensions = ['mp3', 'wav', 'ogg'];
      
      // Try to find the sit-down audio file
      for (const ext of extensions) {
        const audioDown = new Audio(`${staticUrl}sounds/sit-down.${ext}`);
        audioDown.addEventListener('canplaythrough', function() {
          if (!sitDownAudio) {
            sitDownAudio = audioDown;
            sitDownAudio.volume = 0.7;
          }
        }, { once: true });
        audioDown.addEventListener('error', function() {
          // Try next format
        }, { once: true });
        audioDown.load();
      }
      
      // Try to find the sit-up audio file
      for (const ext of extensions) {
        const audioUp = new Audio(`${staticUrl}sounds/sit-up.${ext}`);
        audioUp.addEventListener('canplaythrough', function() {
          if (!sitUpAudio) {
            sitUpAudio = audioUp;
            sitUpAudio.volume = 0.7;
          }
        }, { once: true });
        audioUp.addEventListener('error', function() {
          // Try next format
        }, { once: true });
        audioUp.load();
      }
    } catch (e) {
      console.log("Chair sound files not found or not supported");
    }
  }
  
  function playSitDownSound() {
    try {
      if (sitDownAudio) {
        sitDownAudio.currentTime = 0;
        sitDownAudio.play().catch(e => {
          console.log("Could not play sit-down audio:", e);
        });
      } else {
        // Fallback: try common formats
        const staticUrl = window.STATIC_URL || '/static/';
        const formats = ['mp3', 'wav', 'ogg'];
        for (const format of formats) {
          const audio = new Audio(`${staticUrl}sounds/sit-down.${format}`);
          audio.volume = 0.7;
          audio.play().catch(e => {
            // Try next format
          });
          break;
        }
      }
    } catch (e) {
      console.log("Sit-down audio playback error:", e);
    }
  }
  
  function playSitUpSound() {
    try {
      if (sitUpAudio) {
        sitUpAudio.currentTime = 0;
        sitUpAudio.play().catch(e => {
          console.log("Could not play sit-up audio:", e);
        });
      } else {
        // Fallback: try common formats
        const staticUrl = window.STATIC_URL || '/static/';
        const formats = ['mp3', 'wav', 'ogg'];
        for (const format of formats) {
          const audio = new Audio(`${staticUrl}sounds/sit-up.${format}`);
          audio.volume = 0.7;
          audio.play().catch(e => {
            // Try next format
          });
          break;
        }
      }
    } catch (e) {
      console.log("Sit-up audio playback error:", e);
    }
  }

  // ===== Smooth Scrolling for Nav Links =====
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const targetId = this.getAttribute("href");
      
      if (targetId === "#home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const section = document.querySelector(targetId);
        if (section) {
          const offsetTop = section.offsetTop - 80; // Account for fixed nav
          window.scrollTo({ top: offsetTop, behavior: "smooth" });
        }
      }

      // Update active state
      navLinks.forEach((l) => l.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // ===== Active Link on Scroll =====
  const sections = document.querySelectorAll("section[id], header[id]");
  const navbar = document.getElementById("navbar");

  function updateActiveLink() {
    let scrollPos = window.scrollY + 150; // offset for nav height

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (
        scrollPos >= sectionTop &&
        scrollPos < sectionTop + sectionHeight
      ) {
        navLinks.forEach((link) => link.classList.remove("active"));
        const activeLink = document.querySelector(
          `.nav-link[href="#${sectionId}"]`
        );
        if (activeLink) {
          activeLink.classList.add("active");
        }
      }
    });

    // Handle home section
    if (window.scrollY < 100) {
      navLinks.forEach((link) => link.classList.remove("active"));
      const homeLink = document.querySelector('.nav-link[href="#home"]');
      if (homeLink) {
        homeLink.classList.add("active");
      }
    }
  }

  // ===== Navbar Style on Scroll =====
  function handleNavbarScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  // ===== Mobile Menu Toggle =====
  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const navList = document.getElementById("navList");
  // navLinks already declared above, reusing it

  function toggleMobileMenu() {
    if (mobileMenuToggle && navList) {
      mobileMenuToggle.classList.toggle("active");
      navList.classList.toggle("active");
      
      // Prevent body scroll when menu is open
      if (navList.classList.contains("active")) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
  }

  function closeMobileMenu() {
    if (mobileMenuToggle && navList) {
      mobileMenuToggle.classList.remove("active");
      navList.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleMobileMenu();
    });
  }

  // Close menu when clicking on a nav link
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      closeMobileMenu();
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", function (e) {
    if (navList && navList.classList.contains("active")) {
      if (!navList.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        closeMobileMenu();
      }
    }
  });

  // Close menu on window resize if it becomes desktop size
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
      closeMobileMenu();
    }
  });

  // Close menu with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navList && navList.classList.contains("active")) {
      closeMobileMenu();
    }
  });

  // ===== Throttle scroll updates for performance =====
  let scrollTimeout;
  window.addEventListener("scroll", function () {
    if (!scrollTimeout) {
      scrollTimeout = setTimeout(function () {
        updateActiveLink();
        handleNavbarScroll();
        scrollTimeout = null;
      }, 100);
    }
  });

  // ===== Scroll Indicator Click =====
  const scrollIndicator = document.querySelector(".scroll-indicator");
  if (scrollIndicator) {
    scrollIndicator.addEventListener("click", function () {
      const firstSection = document.querySelector("section");
      if (firstSection) {
        const offsetTop = firstSection.offsetTop - 80;
        window.scrollTo({ top: offsetTop, behavior: "smooth" });
      }
    });
    scrollIndicator.style.cursor = "pointer";
  }

  // ===== Contact Button Smooth Scroll =====
  const contactBtn = document.querySelector(".btn-contact");
  if (contactBtn) {
    contactBtn.addEventListener("click", function (event) {
      event.preventDefault();
      const contactSection = document.querySelector("#contact");
      if (contactSection) {
        const offsetTop = contactSection.offsetTop - 80;
        window.scrollTo({ top: offsetTop, behavior: "smooth" });
      }
    });
  }

  // Initial check
  updateActiveLink();
  handleNavbarScroll();

  // ===== Skill Modal Functionality =====
  const skillModal = document.getElementById("skillModal");
  const skillModalTitle = document.getElementById("skillModalTitle");
  const skillModalDescription = document.getElementById("skillModalDescription");
  const skillModalIcon = document.getElementById("skillModalIcon");
  const skillModalClose = document.querySelector(".skill-modal-close");
  const skillItems = document.querySelectorAll(".skill-item");

  // Open modal when skill item is clicked
  skillItems.forEach((item) => {
    item.addEventListener("click", function () {
      const skillName = this.getAttribute("data-skill");
      const skillDescription = this.getAttribute("data-description");
      const skillIcon = this.querySelector("i");

      if (skillName && skillDescription) {
        skillModalTitle.textContent = skillName;
        skillModalDescription.textContent = skillDescription;
        
        // Copy icon classes
        skillModalIcon.className = skillIcon.className;
        skillModalIcon.classList.add("skill-modal-icon");
        
        skillModal.classList.add("show");
        document.body.style.overflow = "hidden"; // Prevent background scrolling
      }
    });
  });

  // Close modal when close button is clicked
  if (skillModalClose) {
    skillModalClose.addEventListener("click", function () {
      skillModal.classList.remove("show");
      document.body.style.overflow = ""; // Restore scrolling
    });
  }

  // Close modal when clicking outside the modal content
  skillModal.addEventListener("click", function (e) {
    if (e.target === skillModal) {
      skillModal.classList.remove("show");
      document.body.style.overflow = ""; // Restore scrolling
    }
  });

  // Close modal with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && skillModal.classList.contains("show")) {
      skillModal.classList.remove("show");
      document.body.style.overflow = ""; // Restore scrolling
    }
  });

  // ===== Project Tree Click Functionality =====
  const projectNodes = document.querySelectorAll(".project-node");
  
  projectNodes.forEach((node) => {
    node.addEventListener("click", function (e) {
      // Don't trigger if clicking on a link inside the card
      if (e.target.tagName === 'A' || e.target.closest('a')) {
        return;
      }
      
      // Toggle active state
      const isActive = this.classList.contains("active");
      
      // Close all nodes first
      projectNodes.forEach((n) => n.classList.remove("active"));
      
      // If this node wasn't active, open it
      if (!isActive) {
        this.classList.add("active");
      }
    });
  });

  // ===== Server Offline Error Modal =====
  const joinServerBtn = document.getElementById("joinServerBtn");
  const serverOfflineModal = document.getElementById("serverOfflineModal");
  const errorModalClose = document.querySelector(".error-modal-close");
  const errorModalBtn = document.querySelector(".error-modal-btn");

  function showServerOfflineError() {
    if (serverOfflineModal) {
      serverOfflineModal.classList.add("show");
      document.body.style.overflow = "hidden";
    }
  }

  function hideServerOfflineError() {
    if (serverOfflineModal) {
      serverOfflineModal.classList.remove("show");
      document.body.style.overflow = "";
    }
  }

  if (joinServerBtn) {
    joinServerBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      showServerOfflineError();
    });
  }

  if (errorModalClose) {
    errorModalClose.addEventListener("click", hideServerOfflineError);
  }

  if (errorModalBtn) {
    errorModalBtn.addEventListener("click", hideServerOfflineError);
  }

  if (serverOfflineModal) {
    serverOfflineModal.addEventListener("click", function (e) {
      if (e.target === serverOfflineModal) {
        hideServerOfflineError();
      }
    });
  }

  // Close error modal with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && serverOfflineModal && serverOfflineModal.classList.contains("show")) {
      hideServerOfflineError();
    }
  });

  // ===== Contact Form Modal =====
  const openContactFormBtn = document.getElementById("openContactForm");
  const contactFormModal = document.getElementById("contactFormModal");
  const contactModalClose = document.querySelector(".contact-modal-close");
  const contactForm = document.getElementById("contactForm");
  
  console.log("Contact form elements:", {
    openBtn: openContactFormBtn,
    modal: contactFormModal,
    closeBtn: contactModalClose,
    form: contactForm
  }); // Debug

  function showContactForm() {
    if (contactFormModal) {
      contactFormModal.classList.add("show");
      document.body.style.overflow = "hidden";
    }
  }

  function hideContactForm() {
    if (contactFormModal) {
      contactFormModal.classList.remove("show");
      document.body.style.overflow = "";
      // Reset form
      if (contactForm) {
        contactForm.reset();
      }
    }
  }

  if (openContactFormBtn) {
    openContactFormBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      showContactForm();
    });
  }

  if (contactModalClose) {
    contactModalClose.addEventListener("click", hideContactForm);
  }

  if (contactFormModal) {
    contactFormModal.addEventListener("click", function (e) {
      if (e.target === contactFormModal) {
        hideContactForm();
      }
    });
  }

  // Close contact modal with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && contactFormModal && contactFormModal.classList.contains("show")) {
      hideContactForm();
    }
  });

  // Initialize EmailJS (replace with your actual keys after setting up EmailJS account)
  // Get your keys from https://www.emailjs.com/
  // Note: Make sure to use EmailJS service (not Gmail API) to avoid authentication scope issues
  const EMAILJS_PUBLIC_KEY = "xoNNdlL-8ci3ROcRC"; // Replace with your EmailJS public key (found in Account > General)
  const EMAILJS_SERVICE_ID = "service_iqsg9ne"; // Your EmailJS service ID
  const EMAILJS_TEMPLATE_ID = "template_l0b5tey"; // Replace with your EmailJS template ID (create template first, see EMAILJS_TEMPLATE.md)
  
  if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  // Handle form submission
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      
      const name = document.getElementById("contactName").value.trim();
      const email = document.getElementById("contactEmail").value.trim();
      const message = document.getElementById("contactMessage").value.trim();
      const submitBtn = document.getElementById("contactFormSubmitBtn");
      const btnText = submitBtn ? submitBtn.querySelector(".btn-text") : null;
      const btnLoading = submitBtn ? submitBtn.querySelector(".btn-loading") : null;
      const errorDiv = document.getElementById("contactFormError");
      const successDiv = document.getElementById("contactFormSuccess");

      // Hide previous errors
      if (errorDiv) {
        errorDiv.style.display = "none";
        errorDiv.textContent = "";
      }

      // Validate form
      if (!name || !email || !message) {
        if (errorDiv) {
          errorDiv.textContent = "Please fill in all required fields.";
          errorDiv.style.display = "block";
        }
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        if (errorDiv) {
          errorDiv.textContent = "Please enter a valid email address.";
          errorDiv.style.display = "block";
        }
        return;
      }

      // Show loading state
      if (submitBtn) submitBtn.disabled = true;
      if (btnText) btnText.style.display = "none";
      if (btnLoading) btnLoading.style.display = "inline";

      // Prepare email parameters
      const templateParams = {
        from_name: name,
        from_email: email,
        message: message,
        to_email: "kanekabena@gmail.com"
      };

      // Check if EmailJS is available and properly configured
      if (typeof emailjs === 'undefined' || !emailjs.send || 
          EMAILJS_SERVICE_ID === "YOUR_SERVICE_ID" || 
          EMAILJS_TEMPLATE_ID === "YOUR_TEMPLATE_ID") {
        // Fallback to mailto if EmailJS is not configured
        const subject = encodeURIComponent(`Portfolio Contact: ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
        const mailtoLink = `mailto:kanekabena@gmail.com?subject=${subject}&body=${body}`;
        window.location.href = mailtoLink;
        
        // Show success message
        if (contactForm) contactForm.style.display = "none";
        if (successDiv) successDiv.style.display = "block";
        
        // Close modal after 3 seconds
        setTimeout(function() {
          hideContactForm();
        }, 3000);
        return;
      }

      // Send email using EmailJS
      // IMPORTANT: If you're getting Gmail API scope errors, use EmailJS's own email service instead
      // Go to EmailJS Dashboard > Email Services > Add New Service > Choose "EmailJS" (not Gmail)
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function(response) {
          console.log("Email sent successfully!", response.status, response.text);
          
          // Show success message
          if (contactForm) contactForm.style.display = "none";
          if (successDiv) successDiv.style.display = "block";
          
          // Reset form
          contactForm.reset();
          
          // Close modal after 3 seconds
          setTimeout(function() {
            hideContactForm();
          }, 3000);
        })
        .catch(function(error) {
          console.error("Email sending failed:", error);
          
          // Check for Gmail API scope errors
          let errorMessage = "Failed to send message. Please try again or contact me directly at kanekabena@gmail.com";
          if (error.text && error.text.includes("Gmail_API") && error.text.includes("insufficient authentication scopes")) {
            errorMessage = "Email service configuration error. Please use EmailJS service (not Gmail API) or contact me directly at kanekabena@gmail.com";
          }
          
          // Show error message
          if (errorDiv) {
            errorDiv.textContent = errorMessage;
            errorDiv.style.display = "block";
          }
          
          // Reset button state
          if (submitBtn) submitBtn.disabled = false;
          if (btnText) btnText.style.display = "inline";
          if (btnLoading) btnLoading.style.display = "none";
        });
    });
  }

  // Update hideContactForm to reset form state
  function hideContactForm() {
    if (contactFormModal) {
      contactFormModal.classList.remove("show");
      document.body.style.overflow = "";
      
      // Reset form and UI
      if (contactForm) {
        contactForm.reset();
        contactForm.style.display = "block";
      }
      
      const successDiv = document.getElementById("contactFormSuccess");
      if (successDiv) successDiv.style.display = "none";
      
      const errorDiv = document.getElementById("contactFormError");
      if (errorDiv) {
        errorDiv.style.display = "none";
        errorDiv.textContent = "";
      }
      
      const submitBtn = document.getElementById("contactFormSubmitBtn");
      if (submitBtn) {
        submitBtn.disabled = false;
        const btnText = submitBtn.querySelector(".btn-text");
        const btnLoading = submitBtn.querySelector(".btn-loading");
        if (btnText) btnText.style.display = "inline";
        if (btnLoading) btnLoading.style.display = "none";
      }
    }
  }

  // ===== Parallax Effect for Background =====
  window.addEventListener("scroll", function () {
    const scrolled = window.pageYOffset;
    const mountains = document.querySelector(".mountains");
    if (mountains) {
      mountains.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
  });

  // ===== Fade out interactive zones (chair, PC, lamp) when scrolling down =====
  const interactiveZones = document.querySelector(".interactive-zones");
  let lastScrollY = window.scrollY;
  
  window.addEventListener("scroll", function () {
    const currentScrollY = window.scrollY;
    const isMobile = window.innerWidth <= 768;
    
    if (interactiveZones) {
      // Only fade on desktop (>768px), always visible on mobile/tablet
      if (!isMobile && currentScrollY > 50) {
        interactiveZones.classList.add("fade-out");
      } else {
        interactiveZones.classList.remove("fade-out");
      }
    }
    
    lastScrollY = currentScrollY;
  });

  // Ensure zones are visible on mobile on page load
  if (interactiveZones && window.innerWidth <= 768) {
    interactiveZones.classList.remove("fade-out");
  }

  // ===== Fade in animation on scroll =====
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe all sections
  sections.forEach((section) => {
    section.style.opacity = "0";
    section.style.transform = "translateY(30px)";
    section.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(section);
  });

  // Hero section should be visible immediately
  const hero = document.querySelector(".hero");
  if (hero) {
    hero.style.opacity = "1";
    hero.style.transform = "translateY(0)";
  }

  // ===== GitHub Stats - Fetch Live Data =====
  const GITHUB_USERNAME = "Kane7th";
  
  async function fetchGitHubStats() {
    try {
      // Fetch user profile data
      const userResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
      if (!userResponse.ok) throw new Error("Failed to fetch user data");
      const userData = await userResponse.json();
      
      // Fetch all repositories (paginated)
      let allRepos = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const reposResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&page=${page}&sort=updated`);
        if (!reposResponse.ok) break;
        const repos = await reposResponse.json();
        if (repos.length === 0) {
          hasMore = false;
        } else {
          allRepos = allRepos.concat(repos);
          page++;
          // Limit to prevent too many requests
          if (page > 10) hasMore = false;
        }
      }
      
      // Calculate stats
      const reposCount = userData.public_repos || allRepos.length;
      const starsCount = allRepos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
      
      // Calculate contributions (estimate based on repository activity)
      // GitHub's contribution graph API requires authentication, so we estimate
      // based on repository count and activity
      let contributionsCount = 1500; // Default fallback
      try {
        // Estimate: active repos * average contributions per repo
        const activeRepos = allRepos.filter(repo => !repo.archived && !repo.fork).length;
        contributionsCount = Math.max(activeRepos * 25, 1500); // Minimum 1500
      } catch (e) {
        console.log("Could not calculate contributions:", e);
      }
      
      // Calculate total commits across all repositories
      // We'll fetch commit counts from a sample of repos to estimate
      let commitsCount = 2500; // Default fallback
      try {
        // Get commit counts from a sample of most active repos
        const activeRepos = allRepos
          .filter(repo => !repo.archived)
          .sort((a, b) => (b.pushed_at || '').localeCompare(a.pushed_at || ''))
          .slice(0, Math.min(10, allRepos.length)); // Sample top 10 most active
        
        let totalCommits = 0;
        const commitPromises = activeRepos.map(async (repo) => {
          try {
            const commitsResponse = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}/commits?per_page=1`);
            if (commitsResponse.ok) {
              const commits = await commitsResponse.json();
              // Get total count from Link header if available, or estimate
              const linkHeader = commitsResponse.headers.get('Link');
              if (linkHeader) {
                const match = linkHeader.match(/page=(\d+)>; rel="last"/);
                if (match) {
                  return parseInt(match[1]);
                }
              }
              // Estimate based on repo size and activity
              return Math.max(repo.size / 10, 50);
            }
          } catch (e) {
            // If individual repo fails, estimate
            return Math.max(repo.size / 10, 50);
          }
          return 0;
        });
        
        const commitCounts = await Promise.all(commitPromises);
        totalCommits = commitCounts.reduce((sum, count) => sum + count, 0);
        
        // Extrapolate to all repos
        if (activeRepos.length > 0) {
          const avgCommitsPerRepo = totalCommits / activeRepos.length;
          commitsCount = Math.floor(avgCommitsPerRepo * allRepos.filter(r => !r.archived).length);
        }
        
        // Ensure minimum value
        commitsCount = Math.max(commitsCount, 2500);
      } catch (e) {
        console.log("Could not calculate commits:", e);
      }
      
      // Update the data-target attributes
      const reposStat = document.querySelector('[data-stat="repos"]');
      const starsStat = document.querySelector('[data-stat="stars"]');
      const contributionsStat = document.querySelector('[data-stat="contributions"]');
      const commitsStat = document.querySelector('[data-stat="commits"]');
      
      if (reposStat) reposStat.setAttribute("data-target", reposCount.toString());
      if (starsStat) starsStat.setAttribute("data-target", starsCount.toString());
      if (contributionsStat) contributionsStat.setAttribute("data-target", contributionsCount.toString());
      if (commitsStat) commitsStat.setAttribute("data-target", commitsCount.toString());
      
      console.log("GitHub Stats Loaded:", {
        repos: reposCount,
        stars: starsCount,
        contributions: contributionsCount,
        commits: commitsCount
      });
      
      return { reposCount, starsCount, contributionsCount, commitsCount };
    } catch (error) {
      console.error("Error fetching GitHub stats:", error);
      // Use fallback values if API fails
      return {
        reposCount: 50,
        starsCount: 120,
        contributionsCount: 1500,
        commitsCount: 2500
      };
    }
  }

  // ===== GitHub Stats Animated Counter =====
  function animateCounter(element, target, duration = 2000) {
    const start = 0;
    let startTime = null;

    function easeOutQuad(t) {
      return t * (2 - t);
    }

    function animate(currentTime) {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = easeOutQuad(progress);
      const value = Math.floor(easedProgress * (target - start) + start);
      element.textContent = value.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = target.toLocaleString(); // Ensure final value is exact
      }
    }
    requestAnimationFrame(animate);
  }

  // Intersection Observer for GitHub Stats
  const githubStatsSection = document.getElementById("github-stats");
  if (githubStatsSection) {
    // Fetch stats when section comes into view
    let statsFetched = false;
    
    const observerOptions = {
      threshold: 0.3,
      rootMargin: "0px"
    };

    const statsObserver = new IntersectionObserver(async (entries) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting && !statsFetched) {
          statsFetched = true;
          
          // Fetch live GitHub stats
          await fetchGitHubStats();
          
          // Animate counters with fetched data
          const statNumbers = document.querySelectorAll(".github-stat-number");
          statNumbers.forEach((stat) => {
            const target = parseInt(stat.getAttribute("data-target")) || 0;
            if (target > 0 && !stat.classList.contains("animated")) {
              stat.classList.add("animated");
              animateCounter(stat, target);
            }
          });
          
          statsObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    statsObserver.observe(githubStatsSection);
  }
});
