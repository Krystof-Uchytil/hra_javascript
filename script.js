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
let isStarted = false;
let spawnDelay = 2000;
let playerPosition = { x: 0, y: 0 };

// uvodni screen
function showStartScreen() {
    pauseOverlay.style.display = "flex";
    pauseOverlay.innerHTML = `
        <p>Klikni na mezerník pro start hry</p>
    `;
}
showStartScreen();
// start hry mezernikem
document.addEventListener("keydown", (e) => {
    if (e.key === " ") {
        if (!isStarted) {
            isStarted = true;
            startGame();
        } else if (isPaused) {
            resumeGame();
        } else {
            pauseGame();
        }
    }
});
// pohyb podle myši
gameContainer.addEventListener("mousemove", (e) => {
    if (isPaused || isGameOver || !isStarted) return;

    const rect = gameContainer.getBoundingClientRect();
    const x = e.clientX - rect.left - player.offsetWidth / 2;
    const y = e.clientY - rect.top - player.offsetHeight / 2;

    const maxX = gameContainer.offsetWidth - player.offsetWidth;
    const maxY = gameContainer.offsetHeight - player.offsetHeight;

    player.style.left = `${Math.min(Math.max(x, 0), maxX)}px`;
    player.style.top = `${Math.min(Math.max(y, 0), maxY)}px`;
});
// vytvareni cervench kruhu
function spawnEnemy() {
    if (isPaused || isGameOver) return;

    const enemy = document.createElement("div");
    enemy.classList.add("enemy");
    gameContainer.appendChild(enemy);

    const size = Math.random() * 30 + 50;
    enemy.style.width = `${size}px`;
    enemy.style.height = `${size}px`;

    const edge = Math.floor(Math.random() * 4);
    let startX, startY, endX, endY;

    switch (edge) {
        case 0:
            startX = Math.random() * gameContainer.offsetWidth;
            startY = -size;
            endX = Math.random() * gameContainer.offsetWidth;
            endY = gameContainer.offsetHeight + size;
            break;
        case 1:
            startX = Math.random() * gameContainer.offsetWidth;
            startY = gameContainer.offsetHeight + size;
            endX = Math.random() * gameContainer.offsetWidth;
            endY = -size;
            break;
        case 2:
            startX = -size;
            startY = Math.random() * gameContainer.offsetHeight;
            endX = gameContainer.offsetWidth + size;
            endY = Math.random() * gameContainer.offsetHeight;
            break;
        case 3:
            startX = gameContainer.offsetWidth + size;
            startY = Math.random() * gameContainer.offsetHeight;
            endX = -size;
            endY = Math.random() * gameContainer.offsetHeight;
            break;
    }
    enemy.style.left = `${startX}px`;
    enemy.style.top = `${startY}px`;

    const duration = Math.random() * 3000 + 2000;
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
    spawnDelay = Math.max(500, spawnDelay * 0.95);
    spawnTimeout = setTimeout(spawnEnemy, spawnDelay);
}
// kolize
function checkCollisions() {
    if (isPaused || isGameOver) return;

    const playerRect = player.getBoundingClientRect();

    enemies.forEach((enemy) => {
        const enemyRect = enemy.getBoundingClientRect();

        if (
            playerRect.left < enemyRect.right &&
            playerRect.right > enemyRect.left &&
            playerRect.top < enemyRect.bottom &&
            playerRect.bottom > enemyRect.top
        ) {
            lives--;
            livesDisplay.textContent = lives;

            enemy.remove();
            enemies = enemies.filter((e) => e !== enemy);

            if (lives <= 0) {
                endGame();
            }
        }
    });
}
// skryti kouli pri pauze
function hideEnemies() {
    enemies.forEach((enemy) => {
        const computedStyle = getComputedStyle(enemy);
        const transform = computedStyle.transform; // ulozeni aktuálního stavu animace
        enemy.dataset.transform = transform; // ulozeni do atributu
        enemy.style.display = "none"; // skryti kouli
        enemy.style.transform = transform; // zastaveni pohybu
    });
}
// znovu zobrazeni kouli
function showEnemies() {
    enemies.forEach((enemy) => {
        const transform = enemy.dataset.transform || "none"; // nahraje uložený stav
        enemy.style.display = "block"; // znovu zobrazí nepřítele
        enemy.style.transform = transform; // pouzije uloženou pozici
    });
}
function pauseGame() {
    isPaused = true;
    clearTimeout(spawnTimeout);
    clearInterval(gameInterval);
    clearInterval(collisionInterval);
    hideEnemies(); // Skryje nepřátele

    pauseOverlay.style.display = "flex";
    pauseOverlay.innerHTML = `
        <p>Hra je pozastavena</p>
        <p>Stiskněte mezerník pro pokračování</p>
    `;
    const rect = player.getBoundingClientRect();
    playerPosition = { x: rect.left, y: rect.top };
}
function clearEnemies() {
    enemies.forEach((enemy) => {
        enemy.remove();
    });
    enemies = [];
}
// znova zacatek hry
function resumeGame() {
    isPaused = false;
    pauseOverlay.style.display = "none";
    showEnemies(); // ukaze znovu koule
    spawnEnemy();
    gameInterval = setInterval(updateTime, 1000);
    collisionInterval = setInterval(checkCollisions, 50);
    player.style.left = `${playerPosition.x - gameContainer.offsetLeft}px`;
    player.style.top = `${playerPosition.y - gameContainer.offsetTop}px`;
}
// hlidani času
function updateTime() {
    totalSeconds++;
    timeDisplay.textContent = `${Math.floor(totalSeconds / 60)}:${
        totalSeconds % 60 < 10 ? "0" : ""
    }${totalSeconds % 60}`;
}
function endGame() {
    isGameOver = true;
    clearInterval(gameInterval);
    clearTimeout(spawnTimeout);
    clearInterval(collisionInterval);
    clearEnemies();

    let level;
    if (totalSeconds >= 100) level = "Světová třída";
    else if (totalSeconds >= 75) level = "Profesionál";
    else if (totalSeconds >= 50) level = "Poloprofesionál";
    else if (totalSeconds >= 25) level = "Amatér";
    else level = "Noob";

    pauseOverlay.style.display = "flex";
    pauseOverlay.innerHTML = `
        <p>Konec hry!</p>
        <p>Čas přežití: ${Math.floor(totalSeconds / 60)}:${
        totalSeconds % 60 < 10 ? "0" : ""
    }${totalSeconds % 60}</p>
        <p>Dosáhl si úrovně: ${level}</p>
        <p>Stiskněte F5 pro restart</p>
    `;
}
function startGame() {
    const gameRect = gameContainer.getBoundingClientRect();
    const playerWidth = player.offsetWidth;
    const playerHeight = player.offsetHeight;
    const startX = (gameRect.width - playerWidth) / 2;
    const startY = (gameRect.height - playerHeight) / 2;

    player.style.left = `${startX}px`;
    player.style.top = `${startY}px`;
    pauseOverlay.style.display = "none";
    spawnEnemy();
    gameInterval = setInterval(updateTime, 1000);
    collisionInterval = setInterval(checkCollisions, 50);
}

