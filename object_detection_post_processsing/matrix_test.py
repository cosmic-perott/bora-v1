import math
from collections import deque, defaultdict

CLOSE_AREA_RATIO = 0.08
APPROACH_THRESHOLD = 0.015
HISTORY_LEN = 8
LANE_ZONE = 0.35
MIN_TRAJECTORY_FRAMES = 4

car_history = defaultdict(lambda: deque(maxlen=HISTORY_LEN))

def center(box):
    x1,y1,x2,y2 = box[:4]
    return ((x1+x2)/2,(y1+y2)/2)

def box_area_ratio(box, frame_w, frame_h):
    x1,y1,x2,y2 = box[:4]
    box_area = (x2-x1) * (y2-y1)
    return box_area / (frame_w * frame_h)

def expand_box(box, scale=1.2):
    x1, y1, x2, y2 = box[:4]
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

def distance(b1, b2):
    c1 = center(b1)
    c2 = center(b2)
    return math.sqrt((c1[0] - c2[0])**2 + (c1[1] - c2[1])**2)
    
def is_in_my_lane(box, frame_w):
    cx = center(box)[0]
    lane_left  = frame_w * (0.5 - LANE_ZONE / 2)
    lane_right = frame_w * (0.5 + LANE_ZONE / 2)
    return lane_left <= cx <= lane_right
    
def get_trajectory(history):
    if len(history) < MIN_TRAJECTORY_FRAMES:
        return None, None

    positions = [h["center"] for h in history]

    dx_total = positions[-1][0] - positions[0][0]
    dy_total = positions[-1][1] - positions[0][1]
    frames = len(positions) - 1

    dx = dx_total / frames
    dy = dy_total / frames
    return dx, dy

def is_on_collision_course(history, frame_w, frame_h):
    dx, dy = get_trajectory(history)

    if dx is None:
        return False
    moving_toward = dy > 0.5  
    if dy == 0:
        return False

    lateral_ratio = abs(dx) / (abs(dy) + 0.001)
    going_straight = lateral_ratio < 2.0 

    return moving_toward and going_straight

def is_entering_my_lane(history, frame_w):
    if len(history) < MIN_TRAJECTORY_FRAMES:
        return False

    lane_left  = frame_w * (0.5 - LANE_ZONE / 2)
    lane_right = frame_w * (0.5 + LANE_ZONE / 2)

    old_cx = history[0]["center"][0]
    new_cx = history[-1]["center"][0]

    was_outside_left  = old_cx < lane_left
    was_outside_right = old_cx > lane_right

    now_inside = lane_left <= new_cx <= lane_right
    crossing_left  = was_outside_right and new_cx < old_cx  
    crossing_right = was_outside_left  and new_cx > old_cx 

    return (was_outside_left or was_outside_right) and (now_inside or crossing_left or crossing_right)

def check_proximity(boxes, frame_w, frame_h):
    global car_history

    if not boxes:
        car_history.clear()
        return 0, None

    highest_warning = 0
    most_dangerous_box = None

    for box in boxes:
        track_id = box[4]
        cx, cy = center(box)
        area = box_area_ratio(box, frame_w, frame_h)


        car_history[track_id].append({
            "center": (cx, cy),
            "area": area,
            "box": box
        })

        history = car_history[track_id]
        warning = 0

        in_lane = is_in_my_lane(box, frame_w)

        is_close = area >= CLOSE_AREA_RATIO
        if len(history) >= 3:
            area_growth = history[-1]["area"] - history[0]["area"]
            is_approaching = area_growth > APPROACH_THRESHOLD
        else:
            is_approaching = False

        entering_lane = is_entering_my_lane(history, frame_w)

        if (in_lane or entering_lane) and is_close and (is_approaching or on_collision_course):
            warning = 3
        elif (in_lane or entering_lane) and is_close:
            warning = 2
        elif in_lane or entering_lane:
            warning = 1

       
        if warning > highest_warning:
            highest_warning = warning
            most_dangerous_box = box


    active_ids = {box[4] for box in boxes}
    stale_ids = [tid for tid in car_history if tid not in active_ids]
    for tid in stale_ids:
        del car_history[tid]

    return highest_warning, most_dangerous_box

