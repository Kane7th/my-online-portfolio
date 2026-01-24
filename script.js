document.addEventListener("DOMContentLoaded", function () {
  // ===== Workspace Images - Get references once =====
  const workspaceImage1 = document.querySelector(".workspace-image-1");
  const workspaceImage2 = document.querySelector(".workspace-image-2");
  const workspaceImage3 = document.querySelector(".workspace-image-3");
  const workspaceImage4 = document.querySelector(".workspace-image-4");
  const workspaceOverlay = document.querySelector(".workspace-overlay");
  
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
      const staticUrl = window.STATIC_URL || 'static/';
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
        const staticUrl = window.STATIC_URL || 'static/';
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
      const staticUrl = window.STATIC_URL || 'static/';
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
        const staticUrl = window.STATIC_URL || 'static/';
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
        const staticUrl = window.STATIC_URL || 'static/';
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
      const staticUrl = window.STATIC_URL || 'static/';
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
        const staticUrl = window.STATIC_URL || 'static/';
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
        const staticUrl = window.STATIC_URL || 'static/';
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

  // Handle form submission
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      
      const name = document.getElementById("contactName").value;
      const email = document.getElementById("contactEmail").value;
      const message = document.getElementById("contactMessage").value;

      // Create mailto link with form data
      const subject = encodeURIComponent(`Portfolio Contact: ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
      const mailtoLink = `mailto:kanekabena@gmail.com?subject=${subject}&body=${body}`;

      // Open email client
      window.location.href = mailtoLink;

      // Close modal after a short delay
      setTimeout(() => {
        hideContactForm();
      }, 100);
    });
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

  // ===== GitHub Stats Animated Counter =====
  function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16); // 60fps
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target.toLocaleString();
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current).toLocaleString();
      }
    }, 16);
  }

  // Intersection Observer for GitHub Stats
  const githubStatsSection = document.getElementById("github-stats");
  if (githubStatsSection) {
    const observerOptions = {
      threshold: 0.3,
      rootMargin: "0px"
    };

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const statNumbers = document.querySelectorAll(".github-stat-number");
          statNumbers.forEach((stat) => {
            const target = parseInt(stat.getAttribute("data-target"));
            if (target && !stat.classList.contains("animated")) {
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
