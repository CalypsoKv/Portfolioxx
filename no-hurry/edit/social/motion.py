"""MOTION LAB (side experiment): the photo beats re-made as moving plates, in one camera language.

Every shot uses the same camera: a steady push-in ("push": overall zoom over the shot) through a depth map,
where near things move more than far ones ("kz": extra zoom at the nearest depth, "kx"/"ky": lateral drift at the
nearest depth, as fractions of the frame). She is a separate, rigid layer, so her face is only ever scaled and moved.

Keys
  src     photo stem (studio/public/photos) or "broll/<name>"
  hint    where she is in the photo (image fractions) when she is too small for a full-frame matte;
          omit for photos that already have a matte (work/social/cutouts) or have no one in them
  burst   several photos registered on the far background: she steps forward in a stable world (stop-motion)
  near    depth above which the car interior becomes its own layer (None: no near layer)
  focus   rack focus keyframes: [(anchor, "far"|"her"|"near"|number), ...]; default: focused on her
  hazard  amber hazard flash on the car interior, on the real relay grid
  dust    sunlit dust specks drifting in the car (never over her)
  rig     her cut-out is also drawn by Remotion (type-behind-her beats): it gets the same move
"""

CAM = dict(push=0.16, kz=0.28, kx=0.0, ky=0.0)

SHOTS = {
    "B02": dict(src="broll/bust_marble", cam=dict(push=0.16, kz=0.24, kx=-0.05), near=None, focus=[("@0", 0.85)]),
    "B03": dict(src="20261004_151103", hint=[0.6, 0.47], hazard=True, cam=dict(push=0.16, kz=0.30, kx=0.04)),
    "B04": dict(src="20261011_142333", hint=[0.45, 0.46], hazard=True, cam=dict(push=0.16, kz=0.30, kx=-0.04)),
    "B05": dict(src="20260828_170926", hazard=True, dust=True, cam=dict(push=0.18, kz=0.28, kx=0.04)),
    "B06": dict(src="20261004_151111", dust=True, rig=True, focus=[("@0", "far"), ("+10f", "her")],
                cam=dict(push=0.12, kz=0.26, kx=-0.03)),
    "B08-B10": dict(burst=[("B08", "20261012_162415", [0.6, 0.48]), ("B09", "20261012_162416", [0.55, 0.47]),
                           ("B10", "20261012_162417", [0.5, 0.46])],
                    hazard=True, cam=dict(push=0.22, kz=0.30, kx=0.0)),
    "B11": dict(src="20261012_162417", hint=[0.5, 0.46], hazard=True, cam=dict(push=0.12, kz=0.18, kx=0.03)),
    "B12": dict(src="20261012_162417", hint=[0.5, 0.46], hazard=True, cam=dict(push=0.10, kz=0.16, kx=-0.03)),
    "B39": dict(src="20261004_151103", hint=[0.6, 0.47], hazard=True, cam=dict(push=0.16, kz=0.32, kx=-0.035)),
    "B40": dict(src="broll/hazard_button", near=None, lamp=True, cam=dict(push=0.16, kz=0.20, kx=0.03)),
    "B41": dict(src="20261012_162417", hint=[0.5, 0.46], hazard=True, cam=dict(push=0.20, kz=0.32, kx=0.0)),
    "B42": dict(src="20261012_162420", dust=True, near=0.7, cam=dict(push=0.12, kz=0.26, kx=0.035)),
    "B43": dict(src="20261012_162423", dust=True, rig=True, near=0.75, cam=dict(push=0.08, kz=0.16, kx=0.02, ky=0.02)),
    # ---- the rest of the film's photo and b-roll beats (full-length side version)
    "B13": dict(src="broll/tortoise_road", near=None, focus=[("@0", 0.75)], cam=dict(push=0.18, kz=0.30, kx=0.03)),
    "B14": dict(src="20261004_151104", hint=[0.58, 0.45], hazard=True, cam=dict(push=0.16, kz=0.30, kx=-0.035)),
    "B15": dict(src="broll/bronze_runner", near=None, focus=[("@0", 0.85)], cam=dict(push=0.14, kz=0.20, kx=0.05)),
    "B16": dict(src="20260922_024033", hazard=True, cam=dict(push=0.18, kz=0.24, kx=-0.03)),
    "B18": dict(src="broll/hourglass_dashboard", near=None, focus=[("@0", 0.8)], cam=dict(push=0.14, kz=0.26, kx=0.03)),
    "B19": dict(src="20261004_151103", hint=[0.6, 0.47], hazard=True, cam=dict(push=0.12, kz=0.22, kx=0.03)),
    "B21": dict(src="broll/hazard_button", near=None, lamp=True, cam=dict(push=0.16, kz=0.20, kx=-0.03)),
    "B22": dict(src="20261012_162416", hint=[0.55, 0.47], hazard=True, cam=dict(push=0.16, kz=0.30, kx=0.03)),
    "B23": dict(src="20261012_162420", near=0.7, dust=True, cam=dict(push=0.12, kz=0.26, kx=-0.035)),
    "B26": dict(segments=[("@0", "20261011_142333", [0.45, 0.46], [0.47, 0.5, 1.03]),
                          ("L20:half#2", "20261011_142335", [0.47, 0.5], [0.47, 0.5, 1.05]),
                          ("L20:quarter", "20261011_142335", [0.47, 0.5], [0.43, 0.48, 1.6]),
                          ("L20:eighth", "20261011_142335", [0.47, 0.5], [0.41, 0.46, 2.4])],
                hazard=True, cam=dict(push=0.18, kz=0.26)),
    "B27": dict(src="20261011_142342", near=0.7, cam=dict(push=0.12, kz=0.24, kx=0.03)),
    "B30": dict(src="20261009_162044(0)", near=0.72, dust=True, cam=dict(push=0.12, kz=0.24, ky=-0.02)),
    "B31": dict(src="20261004_125103", near=0.72, cam=dict(push=0.14, kz=0.26, kx=0.03)),
    "B32": dict(src="broll/river_mist", near=None, cam=dict(push=0.16, kz=0.28, kx=-0.03)),
    "B36": dict(src="broll/diogenes_lantern", near=None, cam=dict(push=0.14, kz=0.24, kx=0.03)),
    "B37": dict(src="20261014_144251", near=0.7, cam=dict(push=0.12, kz=0.24, kx=-0.03)),
}

# the lab reel: before/after in context (frame ranges of the film)
RANGES = [("B02", "B06"), ("B08", "B12"), ("B39", "B43")]
