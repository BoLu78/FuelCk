#!/usr/bin/env python3
from __future__ import annotations

import math
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUTPUTS = {
    192: ROOT / "icon-192.png",
    512: ROOT / "icon-512.png",
}

SAMPLE_GRID = 4
SAMPLE_OFFSETS = tuple(
    (
        (sample_x + 0.5) / SAMPLE_GRID,
        (sample_y + 0.5) / SAMPLE_GRID,
    )
    for sample_y in range(SAMPLE_GRID)
    for sample_x in range(SAMPLE_GRID)
)

BG = (11, 11, 15)
BADGE = (7, 10, 16)
RING = (19, 57, 92)
INNER = (31, 40, 53)
PAVEMENT = (80, 91, 108, 116)
PAVEMENT_LINE = (126, 140, 161, 92)
DROP = (28, 191, 104)
DROP_SHADOW = (13, 135, 73, 92)
DROP_HIGHLIGHT = (105, 232, 160, 68)
AIRCRAFT = (247, 250, 255)

CENTER = (0.5, 0.5)
BADGE_RADIUS = 0.43
RING_INNER_RADIUS = 0.387
INNER_RADIUS = 0.355

DROP_CENTER = (0.5, 0.5)
DROP_RADIUS = 0.16
DROP_APEX = (0.5, 0.18)
DROP_LEFT = (0.3614359353944898, 0.42)
DROP_RIGHT = (0.6385640646055102, 0.42)

SLAB = (
    (0.28, 0.56),
    (0.72, 0.56),
    (0.79, 0.72),
    (0.21, 0.72),
)
SLAB_LINES = (
    ((0.28, 0.56), (0.72, 0.56), 0.005),
    ((0.37, 0.56), (0.35, 0.72), 0.006),
    ((0.50, 0.56), (0.50, 0.72), 0.006),
    ((0.63, 0.56), (0.65, 0.72), 0.006),
    ((0.24, 0.635), (0.76, 0.635), 0.005),
)

ANGLE = math.radians(-35.0)
U = (math.cos(ANGLE), math.sin(ANGLE))
V = (-U[1], U[0])


def to_world(s: float, t: float, origin: tuple[float, float] = (0.505, 0.505)) -> tuple[float, float]:
    return (
        origin[0] + (s * U[0]) + (t * V[0]),
        origin[1] + (s * U[1]) + (t * V[1]),
    )


FUSELAGE_A = to_world(-0.12, 0.0)
FUSELAGE_B = to_world(0.10, 0.0)
NOSE = (
    to_world(0.09, -0.026),
    to_world(0.16, 0.0),
    to_world(0.09, 0.026),
)
WING_UP = (
    to_world(-0.01, 0.012),
    to_world(-0.075, 0.11),
    to_world(0.035, 0.064),
)
WING_DOWN = (
    to_world(-0.01, -0.012),
    to_world(-0.075, -0.11),
    to_world(0.035, -0.064),
)
TAIL_UP = (
    to_world(-0.10, 0.014),
    to_world(-0.138, 0.058),
    to_world(-0.072, 0.04),
)
TAIL_DOWN = (
    to_world(-0.10, -0.014),
    to_world(-0.138, -0.058),
    to_world(-0.072, -0.04),
)


def blend(base: tuple[int, int, int], top: tuple[int, int, int], alpha: int) -> tuple[int, int, int]:
    if alpha <= 0:
        return base
    mix = alpha / 255.0
    keep = 1.0 - mix
    return (
        int(round((base[0] * keep) + (top[0] * mix))),
        int(round((base[1] * keep) + (top[1] * mix))),
        int(round((base[2] * keep) + (top[2] * mix))),
    )


def distance(point_a: tuple[float, float], point_b: tuple[float, float]) -> float:
    return math.hypot(point_a[0] - point_b[0], point_a[1] - point_b[1])


def point_in_polygon(x: float, y: float, points: tuple[tuple[float, float], ...]) -> bool:
    inside = False
    point_count = len(points)
    for index in range(point_count):
        x1, y1 = points[index]
        x2, y2 = points[(index + 1) % point_count]
        if ((y1 > y) != (y2 > y)) and (x < ((x2 - x1) * (y - y1) / (y2 - y1)) + x1):
            inside = not inside
    return inside


def sign(
    point: tuple[float, float],
    point_a: tuple[float, float],
    point_b: tuple[float, float],
) -> float:
    return (
        (point[0] - point_b[0]) * (point_a[1] - point_b[1])
        - (point_a[0] - point_b[0]) * (point[1] - point_b[1])
    )


def point_in_triangle(
    point: tuple[float, float],
    point_a: tuple[float, float],
    point_b: tuple[float, float],
    point_c: tuple[float, float],
) -> bool:
    d1 = sign(point, point_a, point_b)
    d2 = sign(point, point_b, point_c)
    d3 = sign(point, point_c, point_a)
    has_negative = (d1 < 0.0) or (d2 < 0.0) or (d3 < 0.0)
    has_positive = (d1 > 0.0) or (d2 > 0.0) or (d3 > 0.0)
    return not (has_negative and has_positive)


def point_in_ellipse(
    x: float,
    y: float,
    center_x: float,
    center_y: float,
    radius_x: float,
    radius_y: float,
) -> bool:
    normalized_x = (x - center_x) / radius_x
    normalized_y = (y - center_y) / radius_y
    return (normalized_x * normalized_x) + (normalized_y * normalized_y) <= 1.0


def point_to_segment_distance(
    x: float,
    y: float,
    point_a: tuple[float, float],
    point_b: tuple[float, float],
) -> float:
    ax, ay = point_a
    bx, by = point_b
    abx = bx - ax
    aby = by - ay
    length_squared = (abx * abx) + (aby * aby)
    if length_squared == 0.0:
        return math.hypot(x - ax, y - ay)
    ratio = ((x - ax) * abx + (y - ay) * aby) / length_squared
    ratio = max(0.0, min(1.0, ratio))
    closest_x = ax + (abx * ratio)
    closest_y = ay + (aby * ratio)
    return math.hypot(x - closest_x, y - closest_y)


def soft_alpha(
    x: float,
    y: float,
    center_x: float,
    center_y: float,
    radius: float,
    strength: int,
) -> int:
    fade = 1.0 - (math.hypot(x - center_x, y - center_y) / radius)
    if fade <= 0.0:
        return 0
    return int(round(strength * fade * fade))


def inside_drop(x: float, y: float) -> bool:
    point = (x, y)
    return (
        distance(point, DROP_CENTER) <= DROP_RADIUS
        or point_in_triangle(point, DROP_APEX, DROP_LEFT, DROP_RIGHT)
    )


def inside_aircraft(x: float, y: float) -> bool:
    return (
        point_to_segment_distance(x, y, FUSELAGE_A, FUSELAGE_B) <= 0.018
        or point_in_polygon(x, y, NOSE)
        or point_in_polygon(x, y, WING_UP)
        or point_in_polygon(x, y, WING_DOWN)
        or point_in_polygon(x, y, TAIL_UP)
        or point_in_polygon(x, y, TAIL_DOWN)
    )


def sample_scene(x: float, y: float) -> tuple[int, int, int]:
    color = BG
    badge_distance = distance((x, y), CENTER)

    if badge_distance > BADGE_RADIUS and badge_distance <= BADGE_RADIUS + 0.02:
        shadow_alpha = int(round(80 * (1.0 - ((badge_distance - BADGE_RADIUS) / 0.02)) ** 2))
        color = blend(color, (0, 0, 0), shadow_alpha)

    if badge_distance <= BADGE_RADIUS:
        color = BADGE
        if badge_distance <= INNER_RADIUS:
            color = INNER
        elif badge_distance >= RING_INNER_RADIUS:
            color = RING

        if badge_distance <= INNER_RADIUS:
            highlight_alpha = soft_alpha(x, y, 0.43, 0.32, 0.27, 18)
            if highlight_alpha:
                color = blend(color, (255, 255, 255), highlight_alpha)

            shadow_alpha = soft_alpha(x, y, 0.64, 0.72, 0.35, 30)
            if shadow_alpha:
                color = blend(color, (0, 0, 0), shadow_alpha)

            in_slab = point_in_polygon(x, y, SLAB)
            if in_slab:
                color = blend(color, PAVEMENT[:3], PAVEMENT[3])

                for line_a, line_b, thickness in SLAB_LINES:
                    if point_to_segment_distance(x, y, line_a, line_b) <= thickness:
                        color = blend(color, PAVEMENT_LINE[:3], PAVEMENT_LINE[3])

            if inside_drop(x, y):
                color = DROP

                if point_in_ellipse(x, y, 0.46, 0.565, 0.115, 0.125):
                    color = blend(color, DROP_SHADOW, 92)

                if point_in_ellipse(x, y, 0.552, 0.325, 0.065, 0.085):
                    color = blend(color, DROP_HIGHLIGHT, 68)

                if inside_aircraft(x, y):
                    color = AIRCRAFT

    return color


def render_icon(size: int) -> bytearray:
    samples_per_pixel = len(SAMPLE_OFFSETS)
    output = bytearray(size * size * 4)
    cursor = 0

    for pixel_y in range(size):
        for pixel_x in range(size):
            total_red = 0
            total_green = 0
            total_blue = 0

            for offset_x, offset_y in SAMPLE_OFFSETS:
                sample_x = (pixel_x + offset_x) / size
                sample_y = (pixel_y + offset_y) / size
                red, green, blue = sample_scene(sample_x, sample_y)
                total_red += red
                total_green += green
                total_blue += blue

            output[cursor] = int(round(total_red / samples_per_pixel))
            output[cursor + 1] = int(round(total_green / samples_per_pixel))
            output[cursor + 2] = int(round(total_blue / samples_per_pixel))
            output[cursor + 3] = 255
            cursor += 4

    return output


def png_chunk(chunk_type: bytes, payload: bytes) -> bytes:
    chunk_head = struct.pack(">I", len(payload)) + chunk_type + payload
    checksum = struct.pack(">I", zlib.crc32(chunk_type + payload) & 0xFFFFFFFF)
    return chunk_head + checksum


def write_png(path: Path, size: int, rgba_bytes: bytearray) -> None:
    header = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    stride = size * 4
    image_data = bytearray()

    for row in range(size):
        image_data.append(0)
        start = row * stride
        image_data.extend(rgba_bytes[start : start + stride])

    png_bytes = b"".join(
        (
            b"\x89PNG\r\n\x1a\n",
            png_chunk(b"IHDR", header),
            png_chunk(b"IDAT", zlib.compress(bytes(image_data), level=9)),
            png_chunk(b"IEND", b""),
        )
    )
    path.write_bytes(png_bytes)


def validate_png(path: Path, expected_size: int) -> None:
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"{path.name} is not a PNG file")

    chunk_length = struct.unpack(">I", data[8:12])[0]
    chunk_type = data[12:16]
    if chunk_type != b"IHDR" or chunk_length != 13:
        raise ValueError(f"{path.name} has an invalid IHDR chunk")

    width, height = struct.unpack(">II", data[16:24])
    if width != expected_size or height != expected_size:
        raise ValueError(f"{path.name} has unexpected dimensions: {width}x{height}")


def main() -> None:
    for size, output_path in OUTPUTS.items():
        write_png(output_path, size, render_icon(size))
        validate_png(output_path, size)
        print(f"generated {output_path.name} ({size}x{size})")


if __name__ == "__main__":
    main()
