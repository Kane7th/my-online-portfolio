// ===== Music Player (YouTube) - Global Variables =====
let youtubePlayer = null;
let youtubeApiLoading = false;
let youtubeApiReady = false;

function loadYouTubeApi() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      youtubeApiReady = true;
      resolve();
      return;
    }
    if (youtubeApiLoading) {
      const wait = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(wait);
          youtubeApiReady = true;
          resolve();
        }
      }, 100);
      return;
    }
    youtubeApiLoading = true;
    window.onYouTubeIframeAPIReady = function () {
      youtubeApiReady = true;
      resolve();
      if (typeof initializeYouTubePlayer === "function") initializeYouTubePlayer();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
}

let musicStarted = false;
let isPlaying = false;
const YOUTUBE_VIDEO_ID = "AzV77KFsLn4"; // Extract ID from https://www.youtube.com/watch?v=AzV77KFsLn4

// Global references (will be set in DOMContentLoaded)
let musicToggleBtn = null;
let volumeSlider = null;
let volumeValue = null;
let playIcon = null;
let pauseIcon = null;
let muteIcon = null;

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

// Initialize YouTube IFrame Player - Must be global for YouTube API
function onYouTubeIframeAPIReady() {
  const playerContainer = document.getElementById("youtube-player");
  if (!playerContainer) {
    console.error("YouTube player container not found");
    // Try again after a short delay
    setTimeout(() => {
      const retryContainer = document.getElementById("youtube-player");
      if (retryContainer) {
        initializeYouTubePlayer();
      } else {
        console.error("YouTube player container still not found after retry");
      }
    }, 500);
    return;
  }
  
  initializeYouTubePlayer();
}

function initializeYouTubePlayer() {
  const playerContainer = document.getElementById("youtube-player");
  if (!playerContainer) {
    console.error("Cannot initialize: YouTube player container not found");
    return;
  }
  
  if (youtubePlayer) {
    return;
  }
  
  try {
    youtubePlayer = new YT.Player("youtube-player", {
      height: "0",
      width: "0",
      videoId: YOUTUBE_VIDEO_ID,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        fs: 0,
        iv_load_policy: 3,
        loop: 1,
        playlist: YOUTUBE_VIDEO_ID, // Required for looping
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        showinfo: 0
      },
      events: {
        onReady: function(event) {
          // Set initial volume to 30%
          event.target.setVolume(30);
          if (volumeSlider) {
            volumeSlider.value = 30;
          }
          if (volumeValue) {
            volumeValue.textContent = "30%";
          }
          updateButtonIcons();
        },
        onStateChange: function(event) {
          // YT.PlayerState.PLAYING = 1
          // YT.PlayerState.PAUSED = 2
          // YT.PlayerState.ENDED = 0
          if (event.data === YT.PlayerState.PLAYING) {
            isPlaying = true;
            musicStarted = true;
            updateButtonIcons();
          } else if (event.data === YT.PlayerState.PAUSED) {
            isPlaying = false;
            updateButtonIcons();
          } else if (event.data === YT.PlayerState.ENDED) {
            // Video ended, but with loop: 1 it should restart automatically
            isPlaying = true;
            updateButtonIcons();
          }
        },
        onError: function(event) {
          console.error("YouTube player error:", event.data);
          // Hide music controls if player fails
          if (musicToggleBtn) {
            musicToggleBtn.style.display = "none";
          }
          if (volumeSlider && volumeSlider.parentElement) {
            volumeSlider.parentElement.style.display = "none";
          }
        }
      }
    });
  } catch (error) {
    console.error("Error creating YouTube player:", error);
  }
}

// Make onYouTubeIframeAPIReady available globally
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

document.addEventListener("DOMContentLoaded", function () {
  const NAV_SCROLL_OFFSET = 120;

  // ===== Music Player (YouTube) - Get DOM References =====
  musicToggleBtn = document.getElementById("musicToggleBtn");
  volumeSlider = document.getElementById("musicVolumeSlider");
  volumeValue = document.getElementById("volumeValue");
  playIcon = musicToggleBtn?.querySelector(".music-icon-play");
  pauseIcon = musicToggleBtn?.querySelector(".music-icon-pause");
  muteIcon = musicToggleBtn?.querySelector(".music-icon-muted");

  // Set default volume to 30%
  if (volumeSlider) {
    volumeSlider.value = 30;
  }
  if (volumeValue) {
    volumeValue.textContent = "30%";
  }
  
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
  if (volumeSlider) {
    volumeSlider.addEventListener("input", function (e) {
      const volume = parseInt(e.target.value);
      if (youtubePlayer) {
        youtubePlayer.setVolume(volume);
      }
      if (volumeValue) {
        volumeValue.textContent = `${volume}%`;
      }
      
      // Update icons based on volume
      updateButtonIcons();
      
      // If volume is set to 0, pause the music
      if (volume === 0 && isPlaying && youtubePlayer) {
        youtubePlayer.pauseVideo();
        isPlaying = false;
        updateButtonIcons();
      }
    });
  }

  // Toggle music play/pause
  if (musicToggleBtn) {
    musicToggleBtn.addEventListener("click", async function (e) {
      e.stopPropagation();
      e.preventDefault();

      const volume = volumeSlider ? parseInt(volumeSlider.value) : 30;
      if (volume === 0) return;

      await loadYouTubeApi();
      if (!youtubePlayer) initializeYouTubePlayer();
      if (!youtubePlayer) return;

      if (!isPlaying) {
        youtubePlayer.setVolume(volume);
        youtubePlayer.playVideo();
        musicStarted = true;
        isPlaying = true;
        updateButtonIcons();
      } else {
        youtubePlayer.pauseVideo();
        isPlaying = false;
        updateButtonIcons();
      }
    });
  }

  // Set initial state to paused (play icon visible)
  isPlaying = false;
  updateButtonIcons();
  
  // ===== Workspace Images - Get references once =====
  const workspaceImage1 = document.querySelector(".workspace-image-1");
  const workspaceImage2 = document.querySelector(".workspace-image-2");
  const workspaceImage3 = document.querySelector(".workspace-image-3");
  const workspaceImage4 = document.querySelector(".workspace-image-4");
  const workspaceOverlay = document.querySelector(".workspace-overlay");

  const WORKSPACE_BG = {
    2: "static/images/workspace-2.jpg",
    3: "static/images/workspace-3.jpg",
    4: "static/images/workspace-4.jpg",
  };
  const workspaceBgLoaded = { 1: true, 2: false, 3: false, 4: false };

  function ensureWorkspaceBg(num, done) {
    if (num === 1 || workspaceBgLoaded[num]) {
      if (done) done();
      return;
    }
    const el =
      num === 2 ? workspaceImage2 : num === 3 ? workspaceImage3 : workspaceImage4;
    const src = WORKSPACE_BG[num];
    if (!el || !src) {
      if (done) done();
      return;
    }
    const img = new Image();
    img.onload = function () {
      el.style.backgroundImage = "url('" + src + "')";
      workspaceBgLoaded[num] = true;
      if (done) done();
    };
    img.onerror = function () {
      if (done) done();
    };
    img.src = src;
  }

  function preloadWorkspaceBackgrounds() {
    [2, 3, 4].forEach((n) => ensureWorkspaceBg(n));
  }

  if ("requestIdleCallback" in window) {
    requestIdleCallback(preloadWorkspaceBackgrounds, { timeout: 5000 });
  } else {
    setTimeout(preloadWorkspaceBackgrounds, 3000);
  }

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
  
  // ===== Person Zone Click (Screen) - Cycles: 1 → 4 → 3 → 1 =====
  const personZone = document.getElementById("personZone");
  
  if (personZone) {
    personZone.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
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
            ensureWorkspaceBg(4, () => {
              workspaceImage4.style.opacity = "1";
              playScreenSwitchOnSound();
            });
          } else if (screenClickState === 2) {
            ensureWorkspaceBg(3, () => {
              workspaceImage3.style.opacity = "1";
              screenToggleMode = true;
              screenClickState = 3;
              playScreenSwitchOffSound();
            });
          }
        } else {
          if (screenClickState === 3) {
            ensureWorkspaceBg(4, () => {
              workspaceImage4.style.opacity = "1";
              screenClickState = 4;
              playScreenSwitchOnSound();
            });
          } else {
            ensureWorkspaceBg(3, () => {
              workspaceImage3.style.opacity = "1";
              screenClickState = 3;
              playScreenSwitchOffSound();
            });
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
  
  if (workspace4Zone) {
    workspace4Zone.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (workspaceImage1 && workspaceImage2 && workspaceImage3 && workspaceImage4) {
        // Check which image is currently showing
        const image1Visible = workspaceImage1.style.opacity === "1" || getComputedStyle(workspaceImage1).opacity === "1";
        const image2Visible = workspaceImage2.style.opacity === "1" || getComputedStyle(workspaceImage2).opacity === "1";
        const image3Visible = workspaceImage3.style.opacity === "1" || getComputedStyle(workspaceImage3).opacity === "1";
        const image4Visible = workspaceImage4.style.opacity === "1" || getComputedStyle(workspaceImage4).opacity === "1";
        
        if (image3Visible) {
          workspaceImage1.style.opacity = "0";
          workspaceImage2.style.opacity = "0";
          workspaceImage3.style.opacity = "0";
          ensureWorkspaceBg(4, () => {
            workspaceImage4.style.opacity = "1";
            chairZoneActive = true;
            playSitDownSound();
          });
        } else if (image4Visible) {
          const showPrev = () => {
            workspaceImage1.style.opacity = previousImageBeforeChair === 1 ? "1" : "0";
            workspaceImage2.style.opacity = previousImageBeforeChair === 2 ? "1" : "0";
            workspaceImage3.style.opacity = "0";
            workspaceImage4.style.opacity = "0";
            chairZoneActive = false;
            playSitUpSound();
          };
          if (previousImageBeforeChair === 2) {
            ensureWorkspaceBg(2, showPrev);
          } else {
            showPrev();
          }
        } else {
          if (image1Visible) {
            previousImageBeforeChair = 1;
          } else if (image2Visible) {
            previousImageBeforeChair = 2;
          } else {
            previousImageBeforeChair = 1;
          }

          workspaceImage1.style.opacity = "0";
          workspaceImage2.style.opacity = "0";
          workspaceImage4.style.opacity = "0";
          ensureWorkspaceBg(3, () => {
            workspaceImage3.style.opacity = "1";
            chairZoneActive = true;
            playSitDownSound();
          });
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
toggleLamp();
    });
  }
  
  // Lamp Hint Text - Also clickable
  if (lampHintRight) {
    lampHintRight.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
toggleLamp();
    });
    
    // Make hint arrow clickable too
    const hintArrow = lampHintRight.querySelector(".hint-arrow");
    if (hintArrow) {
      hintArrow.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
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
        ensureWorkspaceBg(2, () => {
          workspaceImage2.style.opacity = "1";
        });
      } else {
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
  
  // Get sound file path helper
  function getSoundPath(filename) {
    // Script is in root, so sounds are at static/sounds/
    let staticUrl = 'static/sounds/';
    if (window.location.pathname.includes('/my-online-portfolio')) {
      staticUrl = '/my-online-portfolio/static/sounds/';
    }
    return `${staticUrl}${filename}`;
  }
  
  // Preload the audio file (simplified - just try to load)
  function preloadLampSound() {
    // Skip preloading - load on demand instead
    // This avoids browser blocking and path issues
  }
  
  function playLampSwitchSound() {
    try {
      if (lampClickAudio && lampClickAudio.readyState >= 2) {
        // Reset to beginning and play
        lampClickAudio.currentTime = 0;
        const playPromise = lampClickAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.error("Could not play lamp audio:", e);
          });
        }
      } else {
        // Load on demand - create new audio instance
        const audioPath = getSoundPath('lamp-click.mp3');
        const audio = new Audio(audioPath);
        audio.volume = 0.7;
        
        // Store for reuse
        if (!lampClickAudio) {
          lampClickAudio = audio;
        }
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
          }).catch(e => {
            console.error(`Failed to play lamp sound: ${audioPath}`, e);
          });
        }
      }
    } catch (e) {
      console.error("Lamp audio playback error:", e);
    }
  }
  
  // Preload sound on page load
  preloadLampSound();
  preloadScreenSounds();
  preloadChairSounds();
  
  // Preload screen switch sounds (simplified - load on demand)
  function preloadScreenSounds() {
    // Skip preloading - load on demand instead
  }
  
  function playScreenSwitchOnSound() {
    try {
      if (screenSwitchOnAudio && screenSwitchOnAudio.readyState >= 2) {
        screenSwitchOnAudio.currentTime = 0;
        const playPromise = screenSwitchOnAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.error("Could not play switch-on audio:", e);
          });
        }
      } else {
        // Load on demand
        const audioPath = getSoundPath('screen-switch-on.mp3');
        const audio = new Audio(audioPath);
        audio.volume = 0.7;
        
        // Store for reuse
        if (!screenSwitchOnAudio) {
          screenSwitchOnAudio = audio;
        }
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
          }).catch(e => {
            console.error(`Failed to play screen switch-on sound: ${audioPath}`, e);
          });
        }
      }
    } catch (e) {
      console.error("Screen switch-on audio playback error:", e);
    }
  }
  
  function playScreenSwitchOffSound() {
    try {
      if (screenSwitchOffAudio && screenSwitchOffAudio.readyState >= 2) {
        screenSwitchOffAudio.currentTime = 0;
        const playPromise = screenSwitchOffAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.error("Could not play switch-off audio:", e);
          });
        }
      } else {
        // Load on demand
        const audioPath = getSoundPath('screen-switch-off.mp3');
        const audio = new Audio(audioPath);
        audio.volume = 0.7;
        
        // Store for reuse
        if (!screenSwitchOffAudio) {
          screenSwitchOffAudio = audio;
        }
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
          }).catch(e => {
            console.error(`Failed to play screen switch-off sound: ${audioPath}`, e);
          });
        }
      }
    } catch (e) {
      console.error("Screen switch-off audio playback error:", e);
    }
  }
  
  // Preload chair (sit down/up) sounds (simplified - load on demand)
  function preloadChairSounds() {
    // Skip preloading - load on demand instead
  }
  
  function playSitDownSound() {
    try {
      if (sitDownAudio && sitDownAudio.readyState >= 2) {
        sitDownAudio.currentTime = 0;
        const playPromise = sitDownAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.error("Could not play sit-down audio:", e);
          });
        }
      } else {
        // Load on demand
        const audioPath = getSoundPath('sit-down.mp3');
        const audio = new Audio(audioPath);
        audio.volume = 0.7;
        
        // Store for reuse
        if (!sitDownAudio) {
          sitDownAudio = audio;
        }
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
          }).catch(e => {
            console.error(`Failed to play sit-down sound: ${audioPath}`, e);
          });
        }
      }
    } catch (e) {
      console.error("Sit-down audio playback error:", e);
    }
  }
  
  function playSitUpSound() {
    try {
      if (sitUpAudio && sitUpAudio.readyState >= 2) {
        sitUpAudio.currentTime = 0;
        const playPromise = sitUpAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.error("Could not play sit-up audio:", e);
          });
        }
      } else {
        // Load on demand
        const audioPath = getSoundPath('sit-up.mp3');
        const audio = new Audio(audioPath);
        audio.volume = 0.7;
        
        // Store for reuse
        if (!sitUpAudio) {
          sitUpAudio = audio;
        }
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
          }).catch(e => {
            console.error(`Failed to play sit-up sound: ${audioPath}`, e);
          });
        }
      }
    } catch (e) {
      console.error("Sit-up audio playback error:", e);
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
          const offsetTop = section.offsetTop - NAV_SCROLL_OFFSET; // Account for fixed nav
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
    let scrollPos = window.scrollY + NAV_SCROLL_OFFSET + 20; // offset for nav height

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
        const offsetTop = contactSection.offsetTop - NAV_SCROLL_OFFSET;
        window.scrollTo({ top: offsetTop, behavior: "smooth" });
      }
    });
  }

    // Initial check
    updateActiveLink();
    handleNavbarScroll();

  // ===== Skill Modal Functionality (legacy; chips used on main page) =====
  const skillModal = document.getElementById("skillModal");
  const skillItems = document.querySelectorAll(".skill-item");
  if (skillModal && skillItems.length) {
  const skillModalTitle = document.getElementById("skillModalTitle");
  const skillModalDescription = document.getElementById("skillModalDescription");
  const skillModalIcon = document.getElementById("skillModalIcon");
  const skillModalClose = document.querySelector(".skill-modal-close");

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
      document.body.style.overflow = "";
    }
  });
  }

  // ===== Project Tree Click Functionality =====
  const projectNodes = document.querySelectorAll(".project-node");
  
  projectNodes.forEach((node) => {
    node.addEventListener("click", function (e) {
      if (e.target.tagName === "A" || e.target.closest("a")) return;
      if (e.target.closest(".project-card-header")) return;

      const isActive = this.classList.contains("active");

      projectNodes.forEach((n) => {
        n.classList.remove("active");
        const h = n.querySelector(".project-card-header");
        if (h) h.setAttribute("aria-expanded", "false");
      });

      if (!isActive) {
        this.classList.add("active");
        const h = this.querySelector(".project-card-header");
        if (h) h.setAttribute("aria-expanded", "true");
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
          !EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY === "YOUR_PUBLIC_KEY" ||
          !EMAILJS_SERVICE_ID || EMAILJS_SERVICE_ID === "YOUR_SERVICE_ID" || 
          !EMAILJS_TEMPLATE_ID || EMAILJS_TEMPLATE_ID === "YOUR_TEMPLATE_ID") {
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
      // Make sure your EmailJS service is set up with a compatible email service (not Gmail API)
      // Recommended: Use EmailJS's own email service or SMTP service
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function(response) {
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
          let errorMessage = "Could not send your message. Try again or email kanekabena@gmail.com";
          if (error.text && error.text.includes("Gmail_API") && error.text.includes("insufficient authentication scopes")) {
            errorMessage = "This form is not wired to email correctly. Email kanekabena@gmail.com instead.";
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
      const userResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
      if (!userResponse.ok) throw new Error("Failed to fetch user data");
      const userData = await userResponse.json();

      let allRepos = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const reposResponse = await fetch(
          `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&page=${page}&sort=updated`
        );
        if (!reposResponse.ok) break;
        const repos = await reposResponse.json();
        if (repos.length === 0) {
          hasMore = false;
        } else {
          allRepos = allRepos.concat(repos);
          page++;
          if (page > 10) hasMore = false;
        }
      }

      const reposCount = userData.public_repos || allRepos.length;
      const starsCount = allRepos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);

      const reposStat = document.querySelector('[data-stat="repos"]');
      const starsStat = document.querySelector('[data-stat="stars"]');
      if (reposStat) reposStat.setAttribute("data-target", reposCount.toString());
      if (starsStat) starsStat.setAttribute("data-target", starsCount.toString());

      return { reposCount, starsCount };
    } catch (error) {
      console.error("Error fetching GitHub stats:", error);
      return { reposCount: 50, starsCount: 120 };
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

  // ===== Reduce motion toggle =====
  const reduceMotionToggle = document.getElementById("reduceMotionToggle");
  const REDUCE_MOTION_KEY = "portfolioReduceMotion";

  function applyReduceMotion(enabled) {
    document.documentElement.classList.toggle("reduce-motion", enabled);
    if (reduceMotionToggle) {
      reduceMotionToggle.setAttribute("aria-pressed", enabled ? "true" : "false");
      reduceMotionToggle.textContent = enabled ? "Motion off" : "Motion";
    }
  }

  const savedReduceMotion = localStorage.getItem(REDUCE_MOTION_KEY);
  const prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  applyReduceMotion(savedReduceMotion === "true" || (savedReduceMotion !== "false" && prefersReduced));

  if (reduceMotionToggle) {
    reduceMotionToggle.addEventListener("click", () => {
      const next = !document.documentElement.classList.contains("reduce-motion");
      applyReduceMotion(next);
      localStorage.setItem(REDUCE_MOTION_KEY, next ? "true" : "false");
    });
  }


  // ===== MySmartRental staging health (project card only) =====
  const healthStatusDot = document.getElementById("healthStatusDot");
  const healthStatusText = document.getElementById("healthStatusText");
  const projectHealthStatus = document.getElementById("projectHealthStatus");
  const HEALTH_URL = "https://staging.mysmartrental.com/api/health";

  async function checkStagingHealth() {
    if (!healthStatusDot || !healthStatusText || !projectHealthStatus) return;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(HEALTH_URL, {
        method: "GET",
        signal: controller.signal,
        mode: "cors",
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error("HTTP " + response.status);
      const data = await response.json().catch(() => ({}));
      const dbOk =
        data.database === "connected" ||
        data.db === "ok" ||
        data.db === "reachable" ||
        data.status === "ok" ||
        data.ok === true;
      healthStatusDot.className = "status-dot status-ok";
      healthStatusText.textContent = dbOk ? "Staging: API + DB online" : "Staging: API online";
      projectHealthStatus.hidden = false;
    } catch (e) {
      projectHealthStatus.hidden = true;
    }
  }

  checkStagingHealth();


  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text == null ? "" : String(text);
    return div.innerHTML;
  }

  // ===== GitHub pinned repositories =====
  const PINNED_REPO_NAMES = [
    "Phase-5-Project-SokoCredit",
    "my-smart-rental",
    "MySmartRental",
    "mysmartrental",
  ];

  async function loadPinnedRepos() {
    const container = document.getElementById("githubPinnedRepos");
    if (!container) return;
    try {
      const response = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`
      );
      if (!response.ok) throw new Error("GitHub API error");
      const repos = await response.json();
      const pinned = [];
      PINNED_REPO_NAMES.forEach((name) => {
        const found = repos.find((r) => r.name.toLowerCase() === name.toLowerCase());
        if (found) pinned.push(found);
      });
      const extras = repos
        .filter((r) => !r.fork && !pinned.some((p) => p.id === r.id))
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, Math.max(0, 3 - pinned.length));
      const display = [...pinned, ...extras].slice(0, 3);
      if (display.length === 0) return;
      container.innerHTML = display
        .map(
          (repo) => `
        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="pinned-repo-card">
          <span class="pinned-repo-name">${escapeHtml(repo.name)}</span>
          <span class="pinned-repo-desc">${escapeHtml(repo.description) || "Open repository on GitHub."}</span>
        </a>`
        )
        .join("");
    } catch (e) {
    }
  }

  const pinnedSection = document.getElementById("githubPinnedRepos");
  if (pinnedSection) {
    const pinnedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadPinnedRepos();
            pinnedObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    pinnedObserver.observe(pinnedSection);
  }
  // ===== Show more projects =====
  const projectsMoreToggle = document.getElementById("projectsMoreToggle");
  const projectsMore = document.getElementById("projectsMore");
  if (projectsMoreToggle && projectsMore) {
    projectsMoreToggle.addEventListener("click", () => {
      const open = projectsMore.hidden;
      projectsMore.hidden = !open;
      projectsMoreToggle.setAttribute("aria-expanded", open ? "true" : "false");
      projectsMoreToggle.textContent = open ? "Hide older projects" : "Show more projects";
    });
  }

  // ===== Project card headers (aria + keyboard) =====
  document.querySelectorAll(".project-card-header").forEach((header) => {
    if (!header.hasAttribute("role")) {
      header.setAttribute("role", "button");
      header.setAttribute("tabindex", "0");
    }
    const nodeForAria = header.closest(".project-node");
    if (nodeForAria && !header.hasAttribute("aria-expanded")) {
      header.setAttribute(
        "aria-expanded",
        nodeForAria.classList.contains("active") ? "true" : "false"
      );
    }
  });
  document.querySelectorAll(".project-card-header[role='button']").forEach((header) => {
    const node = header.closest(".project-node");
    const toggle = () => {
      if (!node) return;
      const isActive = node.classList.contains("active");
      document.querySelectorAll(".project-node").forEach((n) => {
        n.classList.remove("active");
        const h = n.querySelector(".project-card-header[role='button']");
        if (h) h.setAttribute("aria-expanded", "false");
      });
      if (!isActive) {
        node.classList.add("active");
        header.setAttribute("aria-expanded", "true");
      }
    };
    header.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      e.stopPropagation();
      toggle();
    });
    header.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });

  // ===== Prefetch staging on hero CTA hover =====
  const stagingCta = document.getElementById("stagingCta");
  if (stagingCta) {
    const prefetchUrl = stagingCta.getAttribute("data-prefetch");
    let prefetched = false;
    stagingCta.addEventListener("mouseenter", () => {
      if (prefetched || !prefetchUrl) return;
      prefetched = true;
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = prefetchUrl;
      document.head.appendChild(link);
    }, { once: true });
  }


});
