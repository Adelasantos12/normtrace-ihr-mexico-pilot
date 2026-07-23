"""Public, aggregate-only statistical helpers."""
from __future__ import annotations

from math import isfinite


def pass_batch_margin(upper_limits: list[float], margin: float = 0.10) -> bool:
    if not upper_limits or not all(isfinite(value) for value in upper_limits):
        raise ValueError("finite upper limits are required")
    return all(value < margin for value in upper_limits)


def classify_alpha(lower: float, upper: float, half_width: float) -> str:
    values = (lower, upper, half_width)
    if not all(isfinite(value) for value in values) or half_width < 0:
        raise ValueError("finite interval values are required")
    if half_width > 0.10:
        return "imprecise"
    if lower >= 0.80:
        return "high"
    if lower >= 0.667:
        return "acceptable"
    if upper < 0.667:
        return "below_threshold"
    return "inconclusive"
