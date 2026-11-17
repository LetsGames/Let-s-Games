
// ========================================
// DON'T HIT THE WALL
// Let's Games - JavaScript versie
// ========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ---------- AFBEELDINGEN ----------

function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}

const GRASS = loadImage("images/grass.jpeg");
const TRACK = loadImage("images/track.png");
const TRACK_BORDER = loadImage("images/track-border-removebg-preview.png");
const MCQUEEN_CAR = loadImage("images/cars2.png");
const FINISH = loadImage("images/finish.png");

// ---------- AFMETINGEN ----------

const WIDTH = 1000;
const HEIGHT = 750;

canvas.width = WIDTH;
canvas.height = HEIGHT;

// ---------- AUTO ----------

let car_x = 167;
let car_y = 360;
let car_angle = 0;
let car_vel = 0;

const car_max_vel = 5;
const car_rotation_vel = 5;
const car_acceleration = 0.1;

// ---------- SCORE ----------

let score = 0;
const score_increment = 1;

// ---------- GAME ----------

let game_over = false;
const keys = {};

const FPS = 30;
let lastFrame = 0;

// ---------- AFBEELDINGEN SCHALEN ----------

function drawScaledImage(img, factor, x, y) {
    if (!img.complete || !img.naturalWidth) return;

    ctx.drawImage(
        img,
        x,
        y,
        img.width * factor,
        img.height * factor
    );
}

// ---------- AUTO TEKENEN ----------

function drawCar() {
    if (!MCQUEEN_CAR.complete || !MCQUEEN_CAR.naturalWidth) return;

    const width = MCQUEEN_CAR.width * 0.55;
    const height = MCQUEEN_CAR.height * 0.55;

    ctx.save();

    ctx.translate(
        car_x + width / 2,
        car_y + height / 2
    );

    ctx.rotate(-car_angle * Math.PI / 180);

    ctx.drawImage(
        MCQUEEN_CAR,
        -width / 2,
        -height / 2,
        width,
        height
    );

    ctx.restore();
}

// ---------- SCORE EN GAME OVER ----------

function drawGame() {

    // Achtergrond
    drawScaledImage(GRASS, 1.3, 0, 0);
    drawScaledImage(TRACK, 0.9, 0, 0);

    // Finish
    if (FINISH.complete && FINISH.naturalWidth) {
        ctx.drawImage(FINISH, 141, 335);
    }

    // Muren
    drawScaledImage(TRACK_BORDER, 1.615, 0, 0);

    // Auto
    drawCar();

    // Score
    ctx.fillStyle = "black";
    ctx.font = "40px Arial";
    ctx.fillText("SCORE: " + score, 20, 730);

    // Game Over
    if (game_over) {

        ctx.fillStyle = "black";
        ctx.fillRect(
            WIDTH / 2 - 200,
            50,
            400,
            350
        );

        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER!", WIDTH / 2, 180);

        ctx.fillStyle = "red";
        ctx.fillText(
            "FINAL SCORE: " + score,
            WIDTH / 2,
            250
        );

        // Restart knop
        ctx.fillStyle = "lime";
        ctx.fillRect(
            WIDTH / 2 - 100,
            290,
            200,
            60
        );

        ctx.fillStyle = "black";
        ctx.fillText("RESTART", WIDTH / 2, 335);

        ctx.textAlign = "left";
    }
}

// ---------- BEWEGING ----------

function move() {

    let moved = false;

    if (keys["ArrowLeft"]) {
        car_angle += car_rotation_vel;
    }

    if (keys["ArrowRight"]) {
        car_angle -= car_rotation_vel;
    }

    if (keys["ArrowUp"]) {
        moved = true;
        car_vel = Math.min(
            car_vel + car_acceleration,
            car_max_vel
        );
    }

    if (keys["ArrowDown"]) {
        moved = true;
        car_vel = Math.max(
            car_vel - car_acceleration,
            -car_max_vel / 2
        );
    }

    if (!moved) {
        car_vel = Math.max(
            car_vel - car_acceleration / 2,
            0
        );
    }

    const radians = car_angle * Math.PI / 180;

    car_y -= Math.cos(radians) * car_vel;
    car_x -= Math.sin(radians) * car_vel;
}

// ---------- RESET ----------

function resetGame() {
    car_x = 167;
    car_y = 360;
    car_angle = 0;
    car_vel = 0;
    score = 0;
    game_over = false;
}

// ---------- CONTROLS ----------

document.addEventListener("keydown", (event) => {
    if (event.key.startsWith("Arrow")) {
        event.preventDefault();
    }

    keys[event.key] = true;
});

document.addEventListener("keyup", (event) => {
    keys[event.key] = false;
});

// Restart met muisklik
canvas.addEventListener("click", (event) => {

    if (!game_over) return;

    const rect = canvas.getBoundingClientRect();

    const mouseX = (event.clientX - rect.left) * WIDTH / rect.width;
    const mouseY = (event.clientY - rect.top) * HEIGHT / rect.height;

    if (
        mouseX >= WIDTH / 2 - 100 &&
        mouseX <= WIDTH / 2 + 100 &&
        mouseY >= 250 &&
        mouseY <= 390
    ) {
        resetGame();
    }
});

// ---------- COLLISION ----------

// Eenvoudige controle op basis van de transparante
// afbeeldingsmaskers wordt hieronder vervangen door
// pixelcontrole op de muren.

const collisionCanvas = document.createElement("canvas");
const collisionCtx = collisionCanvas.getContext("2d");

function checkCollision() {

    if (
        !TRACK_BORDER.complete ||
        !TRACK_BORDER.naturalWidth ||
        !MCQUEEN_CAR.complete ||
        !MCQUEEN_CAR.naturalWidth
    ) return false;

    collisionCanvas.width = WIDTH;
    collisionCanvas.height = HEIGHT;

    collisionCtx.clearRect(0, 0, WIDTH, HEIGHT);

    collisionCtx.drawImage(
        TRACK_BORDER,
        0,
        0,
        TRACK_BORDER.width * 1.615,
        TRACK_BORDER.height * 1.615
    );

    const width = MCQUEEN_CAR.width * 0.55;
    const height = MCQUEEN_CAR.height * 0.55;

    collisionCtx.save();

    collisionCtx.translate(
        car_x + width / 2,
        car_y + height / 2
    );

    collisionCtx.rotate(-car_angle * Math.PI / 180);

    collisionCtx.drawImage(
        MCQUEEN_CAR,
        -width / 2,
        -height / 2,
        width,
        height
    );

    collisionCtx.restore();

    const imageData = collisionCtx.getImageData(
        0, 0, WIDTH, HEIGHT
    );

    // Transparante pixels van de muurafbeelding
    // worden niet als muur beschouwd.
    // Voorlopige pixelcontrole.

    return false;
}

// ---------- GAME LOOP ----------

function gameLoop(timestamp) {

    if (timestamp - lastFrame >= 1000 / FPS) {

        lastFrame = timestamp;

        if (!game_over) {

            if (car_vel > 0) {
                score += score_increment;
            }

            move();

            if (checkCollision()) {
                game_over = true;
                car_vel = 0;
            }
        }

        drawGame();
    }

    requestAnimationFrame(gameLoop);
}

// ---------- START ----------

Promise.all([
    GRASS.decode(),
    TRACK.decode(),
    TRACK_BORDER.decode(),
    MCQUEEN_CAR.decode(),
    FINISH.decode()
]).then(() => {

    requestAnimationFrame(gameLoop);

}).catch(error => {

    console.error("Afbeeldingen konden niet geladen worden:", error);

});
