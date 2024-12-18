document.addEventListener("DOMContentLoaded", () => {
  // Select elements
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const startBtn = document.getElementById("startBtn");
  const gameOverModal = document.getElementById("gameOverModal");
  const finalScoreText = document.getElementById("finalScoreText");
  const highScoreText = document.getElementById("highScoreText");
  const restartBtn = document.getElementById("restartBtn");

  // Remove this line: No more <p> element below the button
  // const scoreText = document.getElementById("scoreText");

  // Game variables
  let basketWidth = 250;  // Default basket width
  const basketHeight = 30;
  const basketSpeed = 10;

  let basketX;
  let items = [];
  let itemSpeed = 4;
  let score = 0;
  let highScore = 0;
  let lives = 3; // New: Lives counter

  let gameRunning = false;
  let gameOver = false;

  // Key controls
  let leftPressed = false;
  let rightPressed = false;

  // For touch controls
  let touchX = 0; // Touch X position

  // Resize canvas to fill the screen (adjusted height)
  function resizeCanvas() {
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8; // Set height to 80% of the screen height

    // Adjust basket width based on screen size
    if (canvas.width < 500) {
      basketWidth = 100; // Set to 100 if width is below 500px
    } else {
      basketWidth = 250; // Default width for larger screens
    }

    // Recalculate basket position after width change
    basketX = canvas.width / 2 - basketWidth / 2;
  }

  // Call resizeCanvas on window resize and when the page loads
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas(); // Set initial canvas size

  // Key event listeners
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") leftPressed = true;
    if (e.key === "ArrowRight") rightPressed = true;
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") leftPressed = false;
    if (e.key === "ArrowRight") rightPressed = false;
  });

  // Touch event listeners
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchX = touch.pageX;
  });

  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchX = touch.pageX;
  });

  // Start Game
  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", startGame);

  function startGame() {
    resetGame();
    gameRunning = true;
    gameLoop();
    gameOverModal.style.display = "none";
    startBtn.style.display = "none";
  }

  // Reset Game
  function resetGame() {
    basketX = canvas.width / 2 - basketWidth / 2;
    items = [];
    score = 0;
    itemSpeed = 4; // Reset item speed
    lives = 3; // Reset lives
    gameOver = false;
  }

  // Generate falling items
  function generateItem() {
    const itemX = Math.random() * (canvas.width - 20);
    items.push({ x: itemX, y: 0 });
  }

  // Update game logic
  function updateGame() {
    if (gameOver) return;

    // Move basket based on touch position
    if (touchX) {
      const basketCenter = basketX + basketWidth / 2;
      if (touchX < basketCenter - 50 && basketX > 0) {
        basketX -= basketSpeed;
      }
      if (touchX > basketCenter + 50 && basketX < canvas.width - basketWidth) {
        basketX += basketSpeed;
      }
    }

    // Move basket based on arrow keys
    if (leftPressed && basketX > 0) basketX -= basketSpeed;
    if (rightPressed && basketX < canvas.width - basketWidth) basketX += basketSpeed;

    // Move items and check for game over or collision
    for (let i = items.length - 1; i >= 0; i--) {
      let item = items[i];

      item.y += itemSpeed;

      // Check if the item falls outside the basket (missed by the player)
      if (item.y > canvas.height) {
        lives--; // Lose a life
        items.splice(i, 1); // Remove the fallen item
        if (lives === 0) {
          gameOver = true; // Set game over flag
        }
      }

      // Check collision with basket
      if (
        item.y + 20 >= canvas.height - basketHeight &&
        item.x + 20 > basketX &&
        item.x < basketX + basketWidth
      ) {
        score++; // Increase score
        items.splice(i, 1); // Remove the caught item
      }
    }
  }

  // Draw game elements
  function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw basket
    ctx.fillStyle = "green";
    ctx.fillRect(basketX, canvas.height - basketHeight, basketWidth, basketHeight);

    // Draw falling items
    ctx.fillStyle = "red";
    for (const item of items) {
      ctx.beginPath();
      ctx.arc(item.x, item.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }

    // Draw score and lives inside canvas
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Lives: ${lives}`, canvas.width - 100, 30);
  }

  // End game logic
  function endGame() {
    if (score > highScore) highScore = score;

    // Show game over modal
    finalScoreText.textContent = `Your Score: ${score}`;
    highScoreText.textContent = `High Score: ${highScore}`;
    gameOverModal.style.display = "block";
  }

  // Game loop
  function gameLoop() {
    if (!gameRunning) return;

    updateGame();
    drawGame();

    // Check if the game is over
    if (gameOver) {
      endGame();
      return; // Stop the loop if the game is over
    }

    requestAnimationFrame(gameLoop);
  }

  // Generate items periodically
  setInterval(() => {
    if (gameRunning) generateItem();
  }, 1000);

  // Increase item speed every 20 seconds
  setInterval(() => {
    if (gameRunning) {
      itemSpeed += 1; // Increase falling speed by 1
    }
  }, 20000); // Every 20 seconds
});

