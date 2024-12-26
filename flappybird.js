
// Declare variables for the board:
let board;
let boardWidth = 360; // In pixels, the width of what will be the background image.
let boardHeight = 640; // In pixels, the height of what will be the background image.
let context;

// Declare variables for the bird:
let birdWidth = 34; // Bird image has width/height ratio of 17/12 (408 pixels x 228)
let birdHeight = 24; // These birdWidth and birdHeight values (34 and 24) have the same ratio
// Bird's x and y position (co-ordinates):
let birdX = boardWidth / 8; // Bird's x position will not change
let birdY = boardHeight / 2;
let birdImages = []; // Array to hold the bird images
let birdImagesIndex = 0; // Index for bird images

// Create a bird object, with necessary propertie. Assigned values from variables above
let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

// Varibles for the pipes:
// Create an array to store the pipes:
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImage;
let bottomPipeImage;

// Game physics:
let velocityX = -3;  // X velocity for the pipes (in pixels), moving them to the left.
let velocityY = 0; // Bird jump speed
let gravity = 0.4; // Gravity to pull the bird down (increase it's Y value)

// Game rules:
let gameOver = false;
let score = 0;

// Board: When the window object (the global object for client-side JavaScript) loads, an anonymous function is called:
window.onload = function () {
    board = document.getElementById("board"); // Sets the board as the 'board' canvas
    board.height = boardHeight; // Adds a height property and sets it as boardWidth (360)
    board.width = boardWidth; // Adds a width property and sets it as boardWidth (460)
    context = board.getContext("2d"); // Sets the drawing context (2d) for the canvas

    // Load images:
    // Bird:
    for (let i = 0; i < 4; i++) { // For loop to iterate over the birdImages array;
        let birdImage = new Image();
        birdImage.src = `./flappybird${i}.png`;
        birdImages.push(birdImage);
    }
    // Pipes:
    topPipeImage = new Image(); // Assigns a new image to topPipeImage variable
    topPipeImage.src = "./toppipe.png"; // Specify the source (file location) property of the topPipeImage
    bottomPipeImage = new Image();
    bottomPipeImage.src = "./bottompipe.png";

    // Call the requestAnimationFrame() method of window object with an 'update' callback function:
    requestAnimationFrame(update);
    // JavaScript's setInterval() function called with our cllback function 'placePipes' to draw pipes every 1500 ms (1.5 seconds):
    setInterval(placePipes, 1500);
    setInterval(animateBird, 100); // setInterval() called with a cllback to set the animation speed of the bird;
    // Event Listener for key press to make bird move, with moveBird as a callback:
    document.addEventListener("keydown", moveBird);
}

// Update function to repeatedly draw the canvas:
function update() {
    // Invoke requestAnimationFrame(update) recursively, to animate frame by frame:
    requestAnimationFrame(update);
    // If the game is over (a collision was detected), return:
    if (gameOver) {
        return;
    }
    // Call the clearRect() method to clear our canvas:
    context.clearRect(0, 0, board.width, board.height);

    // Redraw bird after canvas is cleared:
    velocityY += gravity;
    // bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0); // Change the bird's y velocity when jumping, with the max Y value set at 0 (the top of the canvas)
    context.drawImage(birdImages[birdImagesIndex], bird.x, bird.y, bird.width, bird.height); // Draw bird image from birdImages array using the birdImagesIndex
    // context.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);
    // Check is the bird has fallen below the canvas:
    if (bird.y > board.height) {
        gameOver = true;
    }

    // Pipes...
    // Loop through pipe array:
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        // Move the pipe to the left, using velocityX:
        pipe.x += velocityX;
        // Draw pipe on canvas:
        context.drawImage(pipe.image, pipe.x, pipe.y, pipe.width, pipe.height);

        // Check if bird has passed the pipe:
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }
        // Call collision detection function with bird and pipe as arguments, setting game over as true if detected:
        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    // Clear pipes that have gone off screen:
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); // Remove the first element of an array
    }

    // Draw score:
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    // Game Over screen:
    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }
    // TopPipe Object:
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2); // Random variable to change pipe y position.
    let openingSpace = board.height / 4;

    let topPipe = {
        image: topPipeImage,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false // Whether or not the bird has passed the pipe
    }
    pipeArray.push(topPipe); // Push this pipe object into our pipe array

    let bottomPipe = {
        image: bottomPipeImage,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace, // Places bottomPipe below the topPipe, with an gap
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(event) {
    // Event parameter is the keypress. Code property returns the key code when a keyboard event occurs:
    if (event.code == "Space" || event.code == "ArrowUp") {
        // Jump:
        velocityY = -6;

        // Reset game to default settings:
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    // Takes 2 parmeters, the bird and pipe object, compares their x and y coordinates, returning a Boolean to determine if they are overlapping:
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
};

function animateBird() {
    birdImagesIndex++; // Increment birdImagesIndex
    birdImagesIndex %= birdImages.length; // Circle back to 0 after we reach the length of image array
};