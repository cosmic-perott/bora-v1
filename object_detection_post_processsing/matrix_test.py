import math
from collections import deque

CLOSE_AREA_RATIO = 0.08
APPROACH_THRESHOLD = 0.015
HISTORY_LEN = 5

area_history = deque(maxlen=HISTORY_LEN)

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

def center(box):
    x1, y1, x2, y2 = box
    return ((x1 + x2) / 2, (y1 + y2) / 2)

def distance(b1, b2):
    c1 = center(b1)
    c2 = center(b2)
    return math.sqrt((c1[0] - c2[0])**2 + (c1[1] - c2[1])**2)

def nearest_box_to_center(boxes, frame_w, frame_h):
    ref = (frame_w / 2, frame_h)
    best, best_dist = None, float("inf")
    for box in boxes:
        cx, cy = center(box)
        d = math.sqrt((cx - ref[0])**2 + (cy - ref[1])**2)
        if d < best_dist:
            best_dist = d
            best = box
    return best

def box_area_ratio(box, frame_w, frame_h):
    x1, y1, x2, y2 = box
    box_area = (x2 - x1) * (y2 - y1)
    return box_area / (frame_w * frame_h)

def check_proximity(boxes, frame_w, frame_h):
    """
    Returns:
        warning_level: 0 = none, 1 = detected, 2 = close, 3 = approaching
        primary_box: the most relevant detected vehicle box
    """
    global area_history

    if not boxes:
        area_history.clear()
        return 0, None

    primary_box = nearest_box_to_center(boxes, frame_w, frame_h)
    area_ratio = box_area_ratio(primary_box, frame_w, frame_h)
    area_history.append(area_ratio)

    warning_level = 1

    if area_ratio >= CLOSE_AREA_RATIO:
        warning_level = 2

    if len(area_history) >= 3:
        growth = area_history[-1] - area_history[0]
        if growth > APPROACH_THRESHOLD:
            warning_level = 3

    return warning_level, primary_box
