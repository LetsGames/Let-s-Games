
import asyncio
import pygame
import math

pygame.init()


# ----- HULPFUNCTIES -----

def scale_image(img, factor):
    size = (
        round(img.get_width() * factor),
        round(img.get_height() * factor)
    )
    return pygame.transform.scale(img, size)


def blit_rotate_center(win, image, top_left, angle):
    rotated_image = pygame.transform.rotate(image, angle)
    new_rect = rotated_image.get_rect(
        center=image.get_rect(topleft=top_left).center
    )
    win.blit(rotated_image, new_rect.topleft)


# ----- LOAD IMAGES -----

GRASS = scale_image(
    pygame.image.load("pages/games/Don't_hit_the_wall/images/grass.jpeg"), 1.3
)

TRACK = scale_image(
    pygame.image.load("pages/games/Don't_hit_the_wall/images/track.png"), 0.9
)

TRACK_BORDER = scale_image(
    pygame.image.load("pages/games/Don't_hit_the_wall/images/track-border-removebg-preview.png"), 1.615
)

TRACK_BORDER_MASK = pygame.mask.from_surface(TRACK_BORDER)

MCQUEEN_CAR = scale_image(
    pygame.image.load("pages/games/Don't_hit_the_wall/images/cars2.png"), 0.55
)

FINISH = pygame.image.load("pages/games/Don't_hit_the_wall/images/finish.png")


# ----- WINDOW -----

WIDTH, HEIGHT = TRACK.get_width(), TRACK.get_height()

WIN = pygame.display.set_mode((WIDTH, HEIGHT))

FONT = pygame.font.SysFont("arial", 40)

pygame.display.set_caption("DON'T HIT THE WALL")

icon = pygame.image.load("images/logo.png")
pygame.display.set_icon(icon)


# ----- CAR VARIABLES -----

def reset_game():
    return 167, 360, 0, 0


# ----- GAMEFUNCTIES -----

def collide(img, car_x, car_y, mask, x=0, y=0):
    car_mask = pygame.mask.from_surface(img)
    offset = (int(car_x - x), int(car_y - y))
    poi = mask.overlap(car_mask, offset)
    return poi


def bounce(vel):
    return -vel


def move(x, y, angle, vel):
    radians = math.radians(angle)
    vertical = math.cos(radians) * vel
    horizontal = math.sin(radians) * vel

    y -= vertical
    x -= horizontal

    return x, y


def move_forward(vel, max_vel, acceleration):
    return min(vel + acceleration, max_vel)


def move_backward(vel, max_vel, acceleration):
    return max(vel - acceleration, -max_vel / 2)


def reduce_speed(vel, acceleration):
    return max(vel - acceleration / 2, 0)


def rotate(angle, rotation_vel, left=False, right=False):
    if left:
        angle += rotation_vel
    elif right:
        angle -= rotation_vel

    return angle


def draw(win, images, car_x, car_y, car_angle, game_over, score):

    for img, pos in images:
        win.blit(img, pos)

    blit_rotate_center(
        win,
        MCQUEEN_CAR,
        (car_x, car_y),
        car_angle
    )

    # Score altijd zichtbaar
    score_text = FONT.render(
        f"SCORE: {score}", True, (0, 0, 0)
    )

    win.blit(score_text, (20, 700))

    if game_over:

        # Game Over tekst
        pygame.draw.rect(
            win,
            (0, 0, 0),
            (WIDTH // 2 - 200, 50, 400, 350)
        )

        text = FONT.render(
            "GAME OVER!", True, (255, 255, 255)
        )

        win.blit(
            text,
            (WIDTH // 2 - text.get_width() // 2, 150)
        )

        # Eindscore
        final_score_text = FONT.render(
            f"FINAL SCORE: {score}",
            True,
            (255, 0, 0)
        )

        win.blit(
            final_score_text,
            (
                WIDTH // 2 - final_score_text.get_width() // 2,
                220
            )
        )

        # Restart knop
        pygame.draw.rect(
            win,
            (0, 255, 0),
            (WIDTH // 2 - 100, 290, 200, 60)
        )

        restart_text = FONT.render(
            "RESTART", True, (0, 0, 0)
        )

        win.blit(
            restart_text,
            (
                WIDTH // 2 - restart_text.get_width() // 2,
                300
            )
        )

    pygame.display.update()


# ----- GAME LOOP -----

async def main():

    # CAR VARIABLES
    car_x = 167
    car_y = 360
    car_angle = 0
    car_vel = 0

    car_max_vel = 5
    car_rotation_vel = 5
    car_acceleration = 0.1

    # SCORE
    score = 0
    score_increment = 1

    # GAME SETTINGS
    run = True
    FPS = 30

    clock = pygame.time.Clock()

    images = [
        (GRASS, (0, 0)),
        (TRACK, (0, 0)),
        (FINISH, (141, 335)),
        (TRACK_BORDER, (0, 0))
    ]

    game_over = False

    while run:

        clock.tick(FPS)

        keys = pygame.key.get_pressed()
        moved = False

        draw(
            WIN,
            images,
            car_x,
            car_y,
            car_angle,
            game_over,
            score
        )

        # EVENTS
        for event in pygame.event.get():

            if event.type == pygame.QUIT:
                run = False
                break

            if game_over and event.type == pygame.MOUSEBUTTONDOWN:

                mouse_pos = pygame.mouse.get_pos()

                # Controleer restart knop
                if (
                    WIDTH // 2 - 100 <= mouse_pos[0] <= WIDTH // 2 + 100
                    and 250 <= mouse_pos[1] <= 390
                ):

                    car_x, car_y, car_angle, car_vel = reset_game()

                    score = 0
                    game_over = False

        if not run:
            break

        # SCORE
        if not game_over and car_vel > 0:
            score += score_increment

        # MOVEMENT
        if not game_over:

            if keys[pygame.K_LEFT]:
                car_angle = rotate(
                    car_angle,
                    car_rotation_vel,
                    left=True
                )

            if keys[pygame.K_RIGHT]:
                car_angle = rotate(
                    car_angle,
                    car_rotation_vel,
                    right=True
                )

            if keys[pygame.K_UP]:

                moved = True

                car_vel = move_forward(
                    car_vel,
                    car_max_vel,
                    car_acceleration
                )

                car_x, car_y = move(
                    car_x,
                    car_y,
                    car_angle,
                    car_vel
                )

            if keys[pygame.K_DOWN]:

                moved = True

                car_vel = move_backward(
                    car_vel,
                    car_max_vel,
                    car_acceleration
                )

                car_x, car_y = move(
                    car_x,
                    car_y,
                    car_angle,
                    car_vel
                )

            if not moved:

                car_vel = reduce_speed(
                    car_vel,
                    car_acceleration
                )

                car_x, car_y = move(
                    car_x,
                    car_y,
                    car_angle,
                    car_vel
                )

            # COLLISION CHECK
            if collide(
                MCQUEEN_CAR,
                car_x,
                car_y,
                TRACK_BORDER_MASK
            ):

                game_over = True
                car_vel = 0

        # BELANGRIJK VOOR PYGBAG
        await asyncio.sleep(0)

    pygame.quit()


# ----- START GAME -----

asyncio.run(main())
