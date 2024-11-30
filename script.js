const gameContainer = document.getElementById("game-container");
const player = document.getElementById("player");
const timeDisplay = document.getElementById("time");
const livesDisplay = document.getElementById("lives");

let lives = 3;
let time = 0;
let enemies = [];
let intervalId;

// Pohyb hráče
gameContainer.addEventListener("mousemove", (e) => {
    const rect = gameContainer.getBoundingClientRect();
    const x = e.clientX - rect.left - player.offsetWidth / 2;
    const y = e.clientY - rect.top - player.offsetHeight / 2;

    player.style.left = `${x}px`;
    player.style.top = `${y}px`;
});

// Vytvoření nepřátel
function spawnEnemy() {
    const enemy = document.createElement("div");
    enemy.classList.add("enemy");
    gameContainer.appendChild(enemy);

    const size = Math.random() * 30 + 20;
    enemy.style.width = `${size}px`;
    enemy.style.height = `${size}px`;

    const startX = Math.random() < 0.5 ? 0 : gameContainer.offsetWidth - size;
    const startY = Math.random() * gameContainer.offsetHeight;

    enemy.style.left = `${startX}px`;
    enemy.style.top = `${startY}px`;

    const speedX = Math.random() * 4 + 2;
    const speedY = Math.random() * 4 - 2;

    enemies.push({ element: enemy, x: startX, y: startY, dx: speedX, dy: speedY });
}

// Aktualizace pozic nepřátel
function updateEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.x += enemy.dx;
        enemy.y += enemy.dy;

        if (enemy.x < 0 || enemy.x > gameContainer.offsetWidth - enemy.element.offsetWidth) {
            enemy.dx *= -1;
        }
        if (enemy.y < 0 || enemy.y > gameContainer.offsetHeight - enemy.element.offsetHeight) {
            enemy.dy *= -1;
        }

        enemy.element.style.left = `${enemy.x}px`;
        enemy.element.style.top = `${enemy.y}px`;

        // Kolize s hráčem
        if (checkCollision(player, enemy.element)) {
            lives -= 1;
            livesDisplay.textContent = lives;
            gameContainer.removeChild(enemy.element);
            enemies.splice(index, 1);

            if (lives === 0) {
                endGame();
            }
        }
    });
}

// Kontrola kolize
function checkCollision(rect1, rect2) {
    const r1 = rect1.getBoundingClientRect();
    const r2 = rect2.getBoundingClientRect();

    return !(
        r1.right < r2.left ||
        r1.left > r2.right ||
        r1.bottom < r2.top ||
        r1.top > r2.bottom
    );
}

// Start hry
function startGame() {
    intervalId = setInterval(() => {
        time += 1;
        timeDisplay.textContent = time;
        spawnEnemy();
        updateEnemies();
    }, 100);
}

// Konec hry
function endGame() {
    clearInterval(intervalId);
    alert(`Konec hry! Přežil(a) jsi ${time} sekund.`);
    location.reload();
}

startGame();