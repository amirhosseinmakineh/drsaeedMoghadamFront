#!/usr/bin/env python3
"""Generate responsive PNG assets from public/*.png without external dependencies."""
from __future__ import annotations

import glob
import os
import struct
import zlib
from pathlib import Path

PNG_SIG = b"\x89PNG\r\n\x1a\n"
WIDTHS = (360, 640, 960)


def read_png(path: str):
    data = Path(path).read_bytes()
    if not data.startswith(PNG_SIG):
        raise ValueError(f"{path}: not a PNG")
    pos = len(PNG_SIG)
    width = height = bit_depth = color_type = None
    compressed = bytearray()
    while pos < len(data):
        length = struct.unpack(">I", data[pos:pos + 4])[0]
        kind = data[pos + 4:pos + 8]
        chunk = data[pos + 8:pos + 8 + length]
        pos += 12 + length
        if kind == b"IHDR":
            width, height, bit_depth, color_type, *_ = struct.unpack(">IIBBBBB", chunk)
        elif kind == b"IDAT":
            compressed.extend(chunk)
        elif kind == b"IEND":
            break
    if bit_depth != 8 or color_type != 2:
        raise ValueError(f"{path}: expected 8-bit RGB PNG, got bit_depth={bit_depth}, color_type={color_type}")

    raw = zlib.decompress(bytes(compressed))
    bpp = 3
    stride = width * bpp
    rows = []
    prev = bytearray(stride)
    i = 0
    for _ in range(height):
        filter_type = raw[i]
        i += 1
        row = bytearray(raw[i:i + stride])
        i += stride
        for x in range(stride):
            left = row[x - bpp] if x >= bpp else 0
            up = prev[x]
            up_left = prev[x - bpp] if x >= bpp else 0
            if filter_type == 1:
                row[x] = (row[x] + left) & 0xFF
            elif filter_type == 2:
                row[x] = (row[x] + up) & 0xFF
            elif filter_type == 3:
                row[x] = (row[x] + ((left + up) >> 1)) & 0xFF
            elif filter_type == 4:
                p = left + up - up_left
                pa, pb, pc = abs(p - left), abs(p - up), abs(p - up_left)
                pr = left if pa <= pb and pa <= pc else up if pb <= pc else up_left
                row[x] = (row[x] + pr) & 0xFF
            elif filter_type != 0:
                raise ValueError(f"unsupported PNG filter {filter_type}")
        rows.append(bytes(row))
        prev = row
    return width, height, rows


def resize_bilinear(width: int, height: int, rows: list[bytes], target_width: int):
    if target_width >= width:
        return width, height, rows
    target_height = max(1, round(height * target_width / width))
    out = []
    x_ratio = (width - 1) / max(1, target_width - 1)
    y_ratio = (height - 1) / max(1, target_height - 1)
    for y in range(target_height):
        sy = y * y_ratio
        y0 = int(sy)
        y1 = min(height - 1, y0 + 1)
        wy = sy - y0
        row0 = rows[y0]
        row1 = rows[y1]
        row = bytearray(target_width * 3)
        for x in range(target_width):
            sx = x * x_ratio
            x0 = int(sx)
            x1 = min(width - 1, x0 + 1)
            wx = sx - x0
            base0 = x0 * 3
            base1 = x1 * 3
            dest = x * 3
            for channel in range(3):
                top = row0[base0 + channel] * (1 - wx) + row0[base1 + channel] * wx
                bottom = row1[base0 + channel] * (1 - wx) + row1[base1 + channel] * wx
                row[dest + channel] = round(top * (1 - wy) + bottom * wy)
        out.append(bytes(row))
    return target_width, target_height, out


def chunk(kind: bytes, payload: bytes) -> bytes:
    return struct.pack(">I", len(payload)) + kind + payload + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF)


def write_png(path: Path, width: int, height: int, rows: list[bytes]):
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    # Filter 0 keeps generation simple and deterministic; high zlib compression keeps files compact.
    raw = b"".join(b"\x00" + row for row in rows)
    compressed = zlib.compress(raw, level=9)
    path.write_bytes(PNG_SIG + chunk(b"IHDR", ihdr) + chunk(b"IDAT", compressed) + chunk(b"IEND", b""))


def main():
    out_dir = Path("public/images")
    out_dir.mkdir(parents=True, exist_ok=True)
    for src in sorted(glob.glob("public/[1-6].png")):
        stem = Path(src).stem
        width, height, rows = read_png(src)
        for target_width in WIDTHS:
            if target_width > width:
                continue
            out_w, out_h, out_rows = resize_bilinear(width, height, rows, target_width)
            dest = out_dir / f"{stem}-{out_w}.png"
            write_png(dest, out_w, out_h, out_rows)
            print(f"{dest} {out_w}x{out_h}")


if __name__ == "__main__":
    main()
