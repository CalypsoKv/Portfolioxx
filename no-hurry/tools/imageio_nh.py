"""Shared image loading: EXIF orientation + embedded ICC profile -> sRGB float32 [0,1]."""
import io

import numpy as np
from PIL import Image, ImageCms, ImageOps

_SRGB = ImageCms.createProfile("sRGB")


def load_srgb(path, max_side=None):
    im = Image.open(path)
    icc = im.info.get("icc_profile")
    im = ImageOps.exif_transpose(im).convert("RGB")
    if icc:
        src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
        im = ImageCms.profileToProfile(im, src, _SRGB, renderingIntent=ImageCms.Intent.RELATIVE_COLORIMETRIC,
                                       outputMode="RGB", flags=ImageCms.Flags.BLACKPOINTCOMPENSATION)
    if max_side and max(im.size) > max_side:
        im.thumbnail((max_side, max_side), Image.LANCZOS)
    return np.asarray(im, np.float32) / 255.0


def srgb_to_linear(v):
    return np.where(v <= 0.04045, v / 12.92, ((v + 0.055) / 1.055) ** 2.4)


def linear_to_srgb(v):
    v = np.clip(v, 0, None)
    return np.where(v <= 0.0031308, v * 12.92, 1.055 * np.power(v, 1 / 2.4) - 0.055)


def luma(v):
    return v[..., 0] * 0.2126 + v[..., 1] * 0.7152 + v[..., 2] * 0.0722
