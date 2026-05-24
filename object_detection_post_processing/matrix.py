import math

def expand_box(box, scale=1.2):
    x1, y1, x2, y2 = box
    w = x2 - x1
    h = y2 - y1

    cx = (x1 + x2) / 2
    cy = (y1 + y2) / 2

    new_w = w * scale
    new_h = h * scale

    return [
        cx - new_w / 2,
        cy - new_h / 2,
        cx + new_w / 2,
        cy + new_h / 2
    ]

def is_inside(box_light, box_car):
    lx1, ly1, lx2, ly2 = box_light
    cx = (lx1 + lx2) / 2
    cy = (ly1 + ly2) / 2

    x1, y1, x2, y2 = box_car
    return x1 <= cx <= x2 and y1 <= cy <= y2

expanded_car = expand_box(car, scale=1.3)

if is_inside(light, expanded_car):
    # assig
    print(0)

def center(box):
    x1, y1, x2, y2 = box
    return ((x1+x2)/2, (y1+y2)/2)

def distance(b1, b2):
    c1 = center(b1)
    c2 = center(b2)
    return math.sqrt((c1[0]-c2[0])**2 + (c1[1]-c2[1])**2)

MAX_DIST = 100  # tune this

closest_car = None
min_dist = float("inf")

for car in cars:
    d = distance(light, car)
    if d < min_dist:
        min_dist = d
        closest_car = car

if min_dist < MAX_DIST:
    assign(light, closest_car)
