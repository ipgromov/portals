// Your 10 rhetorical questions - you can modify these
const questions = [
    "Was befindet sich auf der anderen Seite dieses Portals?",
    "Was machst du auf dieser Straße?",
    "Tritt in dieses Portal der Franklinstraße ein.",
    "Schau nach oben!",
    "Was befindet sich unter den Bänken?",
    "Wie kann die Franklinstraße zu einem Spielplatz werden?",
    "Wie viel Zeit verbringst du hier?",
    "Wie fühlst du dich auf dieser Straße?",
    "Wenn du etwas an dieser Straße ändern könntest, was wäre das?",
    "Wie möchtest du hier auf der Franklinstraße Zeit verbringen?",
    "Tritt in dieses Portal ein und verändere eine Sache an der Franklinstraße."
  ];

let currentQuestionIndex = 0;
let letterDelay = 100; // milliseconds between each letter
let displayDuration = 10000; // 10 seconds to display the full question
let fadeOutDuration = 1500; // 1.5 seconds to fade out
let currentColors = { background: '#000000', text: '#ffffff' };

// Generate a contrasting color pair
function generateColorPair() {
    // Generate a random hue (0-360)
    const baseHue = Math.random() * 360;
    
    // Generate background color - darker, more saturated
    const bgSaturation = 60 + Math.random() * 30; // 60-90%
    const bgLightness = 20 + Math.random() * 15; // 20-35% (dark)
    
    // Generate text color - lighter, complementary or contrasting
    // Use opposite side of color wheel or high contrast
    const textHue = (baseHue + 180 + (Math.random() - 0.5) * 60) % 360; // Complementary with variation
    const textSaturation = 70 + Math.random() * 20; // 70-90%
    const textLightness = 60 + Math.random() * 25; // 60-85% (light)
    
    // Convert HSL to hex
    const bgColor = hslToHex(baseHue, bgSaturation, bgLightness);
    const textColor = hslToHex(textHue, textSaturation, textLightness);
    
    return { background: bgColor, text: textColor };
}

// Convert HSL to hex
function hslToHex(h, s, l) {
    h = h / 360;
    s = s / 100;
    l = l / 100;
    
    let r, g, b;
    
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    const toHex = (c) => {
        const hex = Math.round(c * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Generate a normally distributed random number using Box-Muller transform
function normalRandom(mean = 0, stdDev = 1) {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
}

// Generate baseline variation with normal distribution
// Most letters close to baseline (mean=0), some further away
function generateBaselineVariation() {
    // Use normal distribution: mean=0, stdDev=1.5
    // This means ~68% will be within -1.5px to +1.5px
    // ~95% within -3px to +3px
    // ~99.7% within -4.5px to +4.5px
    let value = normalRandom(0, 1.5);
    
    // Clamp to reasonable range (-4px to +4px)
    value = Math.max(-4, Math.min(4, value));
    
    return value;
}

// Generate letter size variation with normal distribution
// Most letters normal size (mean=1.0), rarely slightly bigger
function generateLetterSize() {
    // Use normal distribution: mean=1.0, stdDev=0.08
    // This means ~68% will be within 0.92 to 1.08
    // ~95% within 0.84 to 1.16
    // ~99.7% within 0.76 to 1.24
    // Most letters will be close to 1.0, rarely bigger
    let value = normalRandom(1.0, 0.08);
    
    // Clamp to reasonable range (0.9 to 1.2)
    // This ensures letters don't get too small or too large
    value = Math.max(0.9, Math.min(1.2, value));
    
    return value;
}

function createLetterElement(char, index) {
    const letter = document.createElement('span');
    letter.className = 'letter';
    
    if (char === ' ') {
        letter.className += ' space';
        letter.innerHTML = '&nbsp;';
    } else {
        letter.textContent = char;
    }
    
    // Add unique floating animation delay for each letter
    const delay = (index * 0.1) % 3;
    letter.style.animationDelay = `${delay}s`;
    
    // Generate baseline variation using normal distribution
    const baselineVariation = generateBaselineVariation();
    letter.style.setProperty('--baseline-y', `${baselineVariation}px`);
    
    // Apply baseline variation immediately (before appear animation)
    // This ensures letters spawn with variation from the start
    letter.style.setProperty('--initial-baseline-y', `${baselineVariation}px`);
    
    // Generate letter size variation using normal distribution
    const letterSize = generateLetterSize();
    letter.style.setProperty('--letter-scale', letterSize);
    
    return letter;
}

// Measure word widths to pre-calculate layout
function measureWordWidth(word, container) {
    // Create a temporary hidden measurement element that matches the actual word structure
    const measurer = document.createElement('span');
    measurer.className = 'word';
    measurer.style.visibility = 'hidden';
    measurer.style.position = 'absolute';
    measurer.style.whiteSpace = 'nowrap';
    measurer.style.opacity = '0';
    measurer.style.pointerEvents = 'none';
    
    // Create letter elements to match the actual structure (with spacing)
    const letters = word.split('');
    letters.forEach(char => {
        const letterSpan = document.createElement('span');
        letterSpan.className = 'letter';
        letterSpan.style.marginRight = '0.05em'; // Match the CSS
        letterSpan.textContent = char;
        measurer.appendChild(letterSpan);
    });
    
    container.appendChild(measurer);
    const width = measurer.offsetWidth;
    container.removeChild(measurer);
    return width;
}

function typeQuestion(question, container) {
    return new Promise((resolve) => {
        // Container is already cleared in fadeOutQuestion, but ensure it's empty
        if (container.innerHTML.trim() !== '') {
            container.innerHTML = '';
        }
        // Reset opacity for new question
        container.style.opacity = '1';
        
        // Split into words to prevent breaking
        const words = question.split(' ');
        let totalChars = question.length;
        
        // Pre-calculate word widths to fix layout
        const wordWidths = words.map(word => measureWordWidth(word, container));
        const spaceWidth = measureWordWidth(' ', container);
        
        // Create all word containers first with fixed widths and heights
        // This pre-calculates positions so layout doesn't shift
        const wordElements = words.map((word, wordIndex) => {
            const wordElement = document.createElement('span');
            wordElement.className = 'word';
            // Set fixed width based on measurement to prevent horizontal shifting
            wordElement.style.width = `${wordWidths[wordIndex]}px`;
            wordElement.style.display = 'inline-block';
            wordElement.style.verticalAlign = 'baseline';
            // Set min-height to prevent vertical shifting as letters appear
            wordElement.style.minHeight = '0.85em'; // Match line-height
            container.appendChild(wordElement);
            return wordElement;
        });
        
        // Simple sequential left-to-right typing: word by word, letter by letter
        let charIndex = 0;
        words.forEach((word, wordIndex) => {
            const wordElement = wordElements[wordIndex];
            const letters = word.split('');
            
            // Type each letter in the word sequentially
            letters.forEach((char, letterIndex) => {
                const index = charIndex++;
                setTimeout(() => {
                    const letterElement = createLetterElement(char, index);
                    wordElement.appendChild(letterElement);
                    
                    // Trigger appearance animation
                    setTimeout(() => {
                        letterElement.classList.add('visible');
                    }, 10);
                    
                    // Resolve when last character is added
                    if (index === totalChars - 1) {
                        setTimeout(() => {
                            resolve();
                        }, letterDelay);
                    }
                }, index * letterDelay);
            });
            
            // Add space after word (except last word) - also sequential
            if (wordIndex < words.length - 1) {
                const spaceIndex = charIndex++;
                setTimeout(() => {
                    const spaceElement = createLetterElement(' ', spaceIndex);
                    wordElement.appendChild(spaceElement);
                    setTimeout(() => {
                        spaceElement.classList.add('visible');
                    }, 10);
                    
                    // Resolve when last character (space) is added
                    if (spaceIndex === totalChars - 1) {
                        setTimeout(() => {
                            resolve();
                        }, letterDelay);
                    }
                }, spaceIndex * letterDelay);
            }
        });
    });
}

function fadeOutQuestion(container) {
    return new Promise((resolve) => {
        // Generate new colors for next question
        const newColors = generateColorPair();
        
        // Start color transition at the same time as fade-out
        const body = document.body;
        body.style.transition = `background-color ${fadeOutDuration}ms ease-out, color ${fadeOutDuration}ms ease-out`;
        body.style.backgroundColor = newColors.background;
        body.style.color = newColors.text;
        
        // Update current colors
        currentColors = newColors;
        
        container.classList.add('fade-out');
        setTimeout(() => {
            // Clear content immediately after fade-out completes
            container.innerHTML = '';
            container.classList.remove('fade-out');
            // Ensure container stays invisible
            container.style.opacity = '0';
            resolve();
        }, fadeOutDuration);
    });
}

async function showNextQuestion() {
    const container = document.getElementById('questionContainer');
    
    if (currentQuestionIndex >= questions.length) {
        // Loop back to the first question
        currentQuestionIndex = 0;
    }
    
    // Generate colors for this question (if first question, generate initial colors)
    if (currentQuestionIndex === 0 && currentColors.background === '#000000') {
        currentColors = generateColorPair();
        document.body.style.backgroundColor = currentColors.background;
        document.body.style.color = currentColors.text;
    }
    
    const question = questions[currentQuestionIndex];
    
    // Type out the question letter by letter
    await typeQuestion(question, container);
    
    // Wait for display duration
    await new Promise(resolve => setTimeout(resolve, displayDuration));
    
    // Fade out (this also transitions to new colors)
    await fadeOutQuestion(container);
    
    // Move to next question
    currentQuestionIndex++;
    
    // Small delay before next question
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Show next question
    showNextQuestion();
}

// Add touch/mouse interaction for subtle effects
document.addEventListener('mousemove', (e) => {
    const letters = document.querySelectorAll('.letter.visible');
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    letters.forEach(letter => {
        const rect = letter.getBoundingClientRect();
        const letterX = rect.left + rect.width / 2;
        const letterY = rect.top + rect.height / 2;
        
        const distance = Math.sqrt(
            Math.pow(mouseX - letterX, 2) + Math.pow(mouseY - letterY, 2)
        );
        
        if (distance < 100) {
            const intensity = (100 - distance) / 100;
            const angle = Math.atan2(mouseY - letterY, mouseX - letterX);
            const moveX = Math.cos(angle) * intensity * 5;
            const moveY = Math.sin(angle) * intensity * 5;
            const baselineY = letter.style.getPropertyValue('--baseline-y') || '0px';
            
            letter.style.setProperty('--interaction-x', `${moveX}px`);
            letter.style.setProperty('--interaction-y', `${moveY}px`);
        } else {
            letter.style.removeProperty('--interaction-x');
            letter.style.removeProperty('--interaction-y');
        }
    });
});

document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        const letters = document.querySelectorAll('.letter.visible');
        const touchX = touch.clientX;
        const touchY = touch.clientY;
        
        letters.forEach(letter => {
            const rect = letter.getBoundingClientRect();
            const letterX = rect.left + rect.width / 2;
            const letterY = rect.top + rect.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(touchX - letterX, 2) + Math.pow(touchY - letterY, 2)
            );
            
            if (distance < 100) {
                const intensity = (100 - distance) / 100;
                const angle = Math.atan2(touchY - letterY, touchX - letterX);
                const moveX = Math.cos(angle) * intensity * 5;
                const moveY = Math.sin(angle) * intensity * 5;
                
                letter.style.setProperty('--interaction-x', `${moveX}px`);
                letter.style.setProperty('--interaction-y', `${moveY}px`);
            } else {
                letter.style.removeProperty('--interaction-x');
                letter.style.removeProperty('--interaction-y');
            }
        });
    }
});

// Reset letter positions when mouse/touch leaves
document.addEventListener('mouseleave', () => {
    const letters = document.querySelectorAll('.letter.visible');
    letters.forEach(letter => {
        letter.style.removeProperty('--interaction-x');
        letter.style.removeProperty('--interaction-y');
    });
});

// Start the sequence
showNextQuestion();

