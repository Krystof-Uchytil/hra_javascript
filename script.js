const gameContainer = document.getElementById("game-container");
const player = document.getElementById("player");
const timeDisplay = document.getElementById("time");
const livesDisplay = document.getElementById("lives");
const pauseOverlay = document.getElementById("pause-overlay");

let lives = 3;
let totalSeconds = 0;
let enemies = [];
let spawnTimeout;
let gameInterval;
let collisionInterval;
let isPaused = false;
let isGameOver = false;
let spawnDelay = 2000;

// Pohyb hráče podle myši
gameContainer.addEventListener("mousemove", (e) => {
    if (isPaused || isGameOver) return;
    const rect = gameContainer.getBoundingClientRect();
    const x = e.clientX - rect.left - player.offsetWidth / 2;
    const y = e.clientY - rect.top - player.offsetHeight / 2;

    // Omezit pohyb na hranice herního pole
    const maxX = gameContainer.offsetWidth - player.offsetWidth;
    const maxY = gameContainer.offsetHeight - player.offsetHeight;

    player.style.left = `${Math.min(Math.max(x, 0), maxX)}px`;
    player.style.top = `${Math.min(Math.max(y, 0), maxY)}px`;
});

// Vytvoření nepřítele
function spawnEnemy() {
    if (isPaused || isGameOver) return;

    const enemy = document.createElement("div");
    enemy.classList.add("enemy");
    gameContainer.appendChild(enemy);

    const size = Math.random() * 30 + 50; // Velikost koule 50-80 px
    enemy.style.width = `${size}px`;
    enemy.style.height = `${size}px`;

    // Náhodný start na jedné straně herního pole
    const edge = Math.floor(Math.random() * 4);
    let startX, startY, endX, endY;

    switch (edge) {
        case 0: // Nahoře
            startX = Math.random() * gameContainer.offsetWidth;
            startY = -size;
            endX = Math.random() * gameContainer.offsetWidth;
            endY = gameContainer.offsetHeight + size;
            break;
        case 1: // Dole
            startX = Math.random() * gameContainer.offsetWidth;
            startY = gameContainer.offsetHeight + size;
            endX = Math.random() * gameContainer.offsetWidth;
            endY = -size;
            break;
        case 2: // Vlevo
            startX = -size;
            startY = Math.random() * gameContainer.offsetHeight;
            endX = gameContainer.offsetWidth + size;
            endY = Math.random() * gameContainer.offsetHeight;
            break;
        case 3: // Vpravo
            startX = gameContainer.offsetWidth + size;
            startY = Math.random() * gameContainer.offsetHeight;
            endX = -size;
            endY = Math.random() * gameContainer.offsetHeight;
            break;
    }

    enemy.style.left = `${startX}px`;
    enemy.style.top = `${startY}px`;

    const duration = Math.random() * 3000 + 2000; // Pohyb trvá 2-5 sekund
    enemy.animate(
        [
            { left: `${startX}px`, top: `${startY}px` },
            { left: `${endX}px`, top: `${endY}px` },
        ],
        {
            duration,
            easing: "linear",
            fill: "forwards",
        }
    ).onfinish = () => {
        gameContainer.removeChild(enemy);
        enemies = enemies.filter((e) => e !== enemy);
    };

    enemies.push(enemy);

    // Další spawn
    spawnDelay = Math.max(500, spawnDelay * 0.95); // Zkracuje interval
    spawnTimeout = setTimeout(spawnEnemy, spawnDelay);
}

// Funkce pro kontrolu kolizí
function checkCollisions() {
    if (isPaused || isGameOver) return;

    const playerRect = player.getBoundingClientRect();

    enemies.forEach((enemy) => {
        const enemyRect = enemy.getBoundingClientRect();

        // Kontrola kolize hráče s koulí
        if (
            playerRect.left < enemyRect.right &&
            playerRect.right > enemyRect.left &&
            playerRect.top < enemyRect.bottom &&
            playerRect.bottom > enemyRect.top
        ) {
            // Snížení životů a odstranění koule
            lives--;
            livesDisplay.textContent = lives;

            // Odebrat koulí z herního pole
            enemy.remove();
            enemies = enemies.filter((e) => e !== enemy);

            // Kontrola konce hry
            if (lives <= 0) {
                endGame();
            }
        }
    });
}

// Konec hry
function endGame() {
    isGameOver = true;
    clearInterval(gameInterval);
    clearTimeout(spawnTimeout);
    clearInterval(collisionInterval);
    pauseOverlay.style.display = "flex";
    pauseOverlay.innerHTML = `
    <p>Konec hry!</p>
    <p>Čas přežití: ${Math.floor(totalSeconds / 60)}:${
        totalSeconds % 60 < 10 ? "0" : ""
    }${totalSeconds % 60}</p>
    <p>Stiskněte F5 pro restart</p>
  `;
}

// Pauza a obnovení hry
document.addEventListener("keydown", (e) => {
    if (e.key === " ") {
        if (isPaused) {
            resumeGame();
        } else {
            pauseGame();
        }
    }
});

function pauseGame() {
    isPaused = true;
    clearTimeout(spawnTimeout);
    clearInterval(gameInterval);
    clearInterval(collisionInterval);
    pauseOverlay.style.display = "flex";
    pauseOverlay.innerHTML = `
    <p>Hra je pozastavena</p>
    <p>Stiskněte mezerník pro pokračování</p>
  `;
}

function resumeGame() {
    isPaused = false;
    pauseOverlay.style.display = "none";
    spawnEnemy();
    gameInterval = setInterval(updateTime, 1000);
    collisionInterval = setInterval(checkCollisions, 50);
}

// Čas
function updateTime() {
    totalSeconds++;
    timeDisplay.textContent = `${Math.floor(totalSeconds / 60)}:${
        totalSeconds % 60 < 10 ? "0" : ""
    }${totalSeconds % 60}`;
}

// Start hry
function startGame() {
    spawnEnemy();
    gameInterval = setInterval(updateTime, 1000);
    collisionInterval = setInterval(checkCollisions, 50); // Kontrola každých 50 ms
}

startGame();


