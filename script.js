// --- Screen Elements ---
const screen1 = document.getElementById('screen1');
const screen2 = document.getElementById('screen2');
const screen3 = document.getElementById('screen3');
const birthdayScreen = document.getElementById("birthdayScreen"); // Existing reference
const finalPage = document.getElementById('finalPage');         // <<< ADD THIS LINE

// --- Buttons and Containers ---
const proceedButton = document.getElementById('proceedButton');
const questionContainer = document.getElementById('questionContainer');
const resultContainer = document.getElementById('resultContainer');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const heartCanvas = document.getElementById('heartCanvas');
const goButton = document.getElementById('goButton');
// const nextButton = document.getElementById('nextButton');

// --- Canvas Setup ---
let ctx; // Declare without assigning
if (heartCanvas) { // Initialize ctx immediately if heartCanvas exists
    ctx = heartCanvas.getContext('2d');
    console.log("Canvas context initialized immediately.");
} else {
    console.error("heartCanvas element not found!");
}
let hearts = [];

// --- Helper: Show Specific Screen ---
function showScreen(screenElement) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('hidden');
    });
    screenElement.classList.add('active');
    screenElement.classList.remove('hidden');
}

// --- Screen 1 Logic ---
proceedButton.addEventListener('click', () => {
    showScreen(screen2);
    questionContainer.classList.remove('hidden');
    resultContainer.classList.add('hidden');
    noBtn.classList.remove('hidden');
    noBtn.addEventListener('mouseover', moveNoButton);
    noBtn.addEventListener('touchstart', moveNoButton);
    yesBtn.style.fontSize = '1.5rem';
    resizeCanvas();
});

// --- No Button Animation ---
function moveNoButton() {
    const containerRect = questionContainer.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();
    const yesRect = yesBtn.getBoundingClientRect();

    const minX = 10, minY = 10;
    const maxX = containerRect.width - noRect.width - 10;
    const maxY = containerRect.height - noRect.height - 10;

    let randomX, randomY, attempts = 0;
    const maxAttempts = 100;

    do {
        randomX = Math.random() * (maxX - minX) + minX;
        randomY = Math.random() * (maxY - minY) + minY;
        const buffer = 20;

        const potentialRect = {
            left: containerRect.left + randomX,
            top: containerRect.top + randomY,
            right: containerRect.left + randomX + noRect.width,
            bottom: containerRect.top + randomY + noRect.height,
        };

        var overlap = !(
            potentialRect.right < yesRect.left - buffer ||
            potentialRect.left > yesRect.right + buffer ||
            potentialRect.bottom < yesRect.top - buffer ||
            potentialRect.top > yesRect.bottom + buffer
        );

        attempts++;
        if (attempts > maxAttempts) break;
    } while (overlap);

    noBtn.style.position = 'absolute';
    noBtn.style.left = `${randomX}px`;
    noBtn.style.top = `${randomY}px`;

    noBtn.animate([
        { transform: 'translateY(0px)' },
        { transform: 'translateY(-20px)' },
        { transform: 'translateY(0px)' }
    ], {
        duration: 300,
        easing: 'ease-out'
    });

    let scale = parseFloat(yesBtn.dataset.scale || "1");
    scale += 0.1;
    yesBtn.dataset.scale = scale.toString();
    yesBtn.style.transform = `scale(${scale})`;

    if (scale > 1.8) {
        noBtn.classList.add('hidden');
        noBtn.removeEventListener('mouseover', moveNoButton);
        noBtn.removeEventListener('touchstart', moveNoButton);
    }
}

// --- Resize Canvas ---
function resizeCanvas() {
    if (heartCanvas) {
        heartCanvas.width = screen2.offsetWidth;
        heartCanvas.height = screen2.offsetHeight;
    }
}

// --- Draw a Single Heart ---
function drawHeart(x, y, size, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(size / 10, size / 10);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(0, -3, -5, -3, -5, 0);
    ctx.bezierCurveTo(-5, 3, 0, 5, 0, 8);
    ctx.bezierCurveTo(0, 5, 5, 3, 5, 0);
    ctx.bezierCurveTo(5, -3, 0, -3, 0, 0);
    ctx.fillStyle = '#ff85a2';
    ctx.fill();
    ctx.restore();
}

// --- Heart Explosion Animation ---
function animateHearts() {
    if (!ctx) return; // Ensure ctx is available

    ctx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
    hearts.forEach(heart => {
        drawHeart(heart.x, heart.y, heart.size, heart.angle);
        heart.y -= heart.speed;
        heart.angle += heart.rotateSpeed;
    });
    hearts = hearts.filter(h => h.y + h.size > 0);

    if (hearts.length > 0) {
        requestAnimationFrame(animateHearts);
    } else {
        heartCanvas.style.display = 'none';
        showScreen(document.getElementById("screen3"));
        resultContainer.classList.remove('hidden');
        resultContainer.style.display = 'block';
    }
}

// --- Yes Button Logic ---
yesBtn.addEventListener('click', () => {
    if (!ctx) {
        console.error("Canvas context is not initialized when Yes button is clicked!");
        return;
    }

    questionContainer.classList.add('hidden');
    heartCanvas.classList.remove('hidden');
    heartCanvas.style.display = 'block';
    resizeCanvas();

    noBtn.removeEventListener('mouseover', moveNoButton);
    noBtn.removeEventListener('touchstart', moveNoButton);

    hearts = [];
    for (let i = 0; i < 100; i++) {
        hearts.push({
            x: Math.random() * heartCanvas.width,
            y: heartCanvas.height + Math.random() * 50,
            size: Math.random() * 15 + 10,
            speed: Math.random() * 3 + 2,
            angle: Math.random() * Math.PI * 2,
            rotateSpeed: (Math.random() - 0.5) * 0.05
        });
    }

    animateHearts();

    // --- START MUSIC ON YES CLICK AND SET LOCAL STORAGE FLAG ---
    const bgMusicElement = document.getElementById("bgMusic");
    if (bgMusicElement && bgMusicElement.paused) {
        bgMusicElement.play().catch(error => {
            console.error("Error playing background music on Yes click:", error);
        });
        localStorage.setItem('musicStarted', 'true'); // Set the flag
    }
    // --- END OF BLOCK ---
});

// --- Go Button to Final Birthday Message ---
goButton.addEventListener('click', () => {
    screen3.classList.remove("active");
    screen3.classList.add("hidden");

    const birthdayScreen = document.getElementById("birthdayScreen");
    birthdayScreen.classList.add("active");
    birthdayScreen.classList.remove("hidden");

    // We don't need to play bgMusic here anymore, it starts on the 'Yes' click
});

window.onload = () => {
    // Initialize canvas context if heartCanvas exists and ctx is not already set
    if (!ctx && heartCanvas) {
        ctx = heartCanvas.getContext('2d');
        console.log("Canvas context initialized in window.onload (fallback).");
    } else if (!heartCanvas) {
        console.error("heartCanvas still not found in window.onload!");
    }

    // Check URL hash to determine which screen to show initially
    const currentHash = window.location.hash; // Get the part after #
    if (currentHash === '#finalPage' && finalPage) {
        showScreen(finalPage);
    } else {
        showScreen(screen1);
    }
    window.addEventListener('resize', resizeCanvas);

    const bgMusicElement = document.getElementById("bgMusic");

    // --- RESET MUSIC TO START ON INITIAL PAGE LOAD (No localStorage check) ---
    if (bgMusicElement) {
        bgMusicElement.currentTime = 0;
    }
    // --- END OF INITIAL MUSIC RESET ---

    // --- CONSISTENTLY ATTEMPT TO RESUME MUSIC ON SUBSEQUENT LOADS (returning from gift) ---
    const storedTime = localStorage.getItem('musicTime');
    const wasPlaying = localStorage.getItem('musicPlaying');
    const musicStartedFlag = localStorage.getItem('musicStarted'); // Check if music was ever started

    if (bgMusicElement) {
        if (musicStartedFlag === 'true' && wasPlaying === 'true' && storedTime) {
            bgMusicElement.currentTime = parseFloat(storedTime);
            bgMusicElement.play().catch(error => {
                console.error("Error resuming music (back from gift):", error);
            });
            localStorage.removeItem('musicTime');
            localStorage.removeItem('musicPlaying');
        } else if (musicStartedFlag === 'true' && wasPlaying === 'true' && bgMusicElement.paused) {
            bgMusicElement.play().catch(error => {
                console.error("Error playing music (was playing):", error);
            });
            localStorage.removeItem('musicPlaying');
        } else {
            localStorage.removeItem('musicTime');
            localStorage.removeItem('musicPlaying');
        }
    }
    // --- END OF RESUME ATTEMPT ---
};

// --- Custom Alert (optional utility) ---
function alert(message) {
    console.log("ALERT:", message);
    const customAlert = document.createElement('div');
    customAlert.style.position = 'fixed';
    customAlert.style.top = '20px';
    customAlert.style.left = '50%';
    customAlert.style.transform = 'translateX(-50%)';
    customAlert.style.backgroundColor = '#ffb3b3';
    customAlert.style.color = '#5b21b6';
    customAlert.style.padding = '15px';
    customAlert.style.borderRadius = '10px';
    customAlert.style.zIndex = '1000';
    customAlert.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
    customAlert.style.fontFamily = 'Arial, sans-serif';
    customAlert.innerText = message;
    document.body.appendChild(customAlert);
    setTimeout(() => customAlert.remove(), 5000);
}

// --- Background Music and Mute Toggle ---
const bgMusic = document.getElementById("bgMusic");
const muteToggle = document.getElementById("muteToggle");

// We are now trying to play on 'Yes' click, so we can remove this initial click listener
// window.addEventListener("click", () => {
//     bgMusic.play();
// }, { once: true });

muteToggle.addEventListener("click", () => {
    bgMusic.muted = !bgMusic.muted;
    muteToggle.textContent = bgMusic.muted ? "🔇" : "🔊";
});

// --- Floating Emojis ---
function createFloatingEmojis() {
    const emojis = document.querySelector(".floating-emojis");
    const symbols = ["💖", "🎀", "💝", "💞", "💓", "🎗️"];

    for (let i = 0; i < 20; i++) {
        const emoji = document.createElement("div");
        emoji.classList.add("emoji");
        emoji.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        emoji.style.left = Math.random() * 100 + "vw";
        emoji.style.animationDuration = (5 + Math.random() * 5) + "s";
        emojis.appendChild(emoji);
    }
}

createFloatingEmojis();

// --- Logic to go from Birthday Screen to Final Page ---
const finalSurpriseBtn = document.getElementById('finalSurpriseBtn');

if (finalSurpriseBtn) {
    finalSurpriseBtn.addEventListener('click', () => {
        console.log("Final surprise button clicked!"); // Debug log
        // Hide the current screen (birthdayScreen) using the class system
        if (birthdayScreen) { // Check if birthdayScreen exists
            birthdayScreen.classList.remove('active');
            birthdayScreen.classList.add('hidden');
        } else {
            console.error("birthdayScreen element not found");
        }
        // Show the final page using the established function
        if (finalPage) { // Check if finalPage exists
            showScreen(finalPage);
             // Add fadeIn class if you have CSS for it, otherwise remove next line
            finalPage.classList.add('fadeIn');
        } else {
            console.error("finalPage element not found");
        }
        // Optional: Stop or fade previous music
        // bgMusic.pause();
    });
} else {
    console.error("Element with ID 'finalSurpriseBtn' not found.");
}

// --- Modal Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const openModalButtons = document.querySelectorAll('[data-modal-target]');
    const closeModalButtons = document.querySelectorAll('.close-button');
    const overlay = document.getElementById('overlay');
    const bgMusicElement = document.getElementById("bgMusic");
    // const sparkleSound = document.getElementById('sparkle-sound');
    // const giftModalTrigger = document.querySelector('[data-modal-target="#modal-gift"]');

    const openModal = (modal) => {
        if (modal == null) return;
        modal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = (modal) => {
        if (modal == null) return;
        modal.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    openModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = document.querySelector(button.dataset.modalTarget);
            openModal(modal);
        });
    });

    // --- Navigation for Gift Option ---
// ... your existing JavaScript code ...

// --- Navigation for Gift Option ---
// --- Navigation for Gift Option ---
const giftOptionButton = document.getElementById('giftOption');

if (giftOptionButton) {
    giftOptionButton.addEventListener('click', (event) => {
        console.log("Gift option clicked, redirecting to flower animation page...");
        event.preventDefault(); // Prevent any default behavior

        const bgMusicElement = document.getElementById("bgMusic");
        if (bgMusicElement) {
            localStorage.setItem('musicTime', bgMusicElement.currentTime);
            localStorage.setItem('musicPlaying', !bgMusicElement.paused);
        }

        window.location.href = 'flower.html';
    });
} else {
    console.error("Gift option button not found.");
}
// ... the rest of your JavaScript code ...

    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });

    overlay.addEventListener('click', () => {
        const activeModals = document.querySelectorAll('.modal.active');
        activeModals.forEach(modal => {
            closeModal(modal);
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const activeModals = document.querySelectorAll('.modal.active');
            activeModals.forEach(modal => {
                closeModal(modal);
            });
        }
    });
});



// Flower Animation