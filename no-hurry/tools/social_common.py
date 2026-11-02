"""Shared helpers for the social cut: timeline, anchor resolution, storyboard beats."""
import importlib.util, json, math, os, re

TICK_START, TICK_PERIOD = 0.0, 0.72   # hazard relay cycle; also the cut grid for beat anchors


def norm(w):
    return re.sub(r"[^a-z0-9']", "", w.lower().replace("’", "'"))


class Social:
    def __init__(self, root):
        self.root = root
        self.tl = json.load(open(os.path.join(root, "work", "social", "timeline.json")))
        self.fps = self.tl["fps"]
        self.lines = {l["id"]: l for l in self.tl["lines"]}
        spec = importlib.util.spec_from_file_location("storyboard", os.path.join(root, "edit", "social", "storyboard.py"))
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        self.beats = [dict(b) for b in mod.BEATS]
        for b in self.beats:
            b["t0"] = self.at(b["start"])
        for i, b in enumerate(self.beats):
            b["t1"] = self.beats[i + 1]["t0"] if i + 1 < len(self.beats) else self.tl["duration"]
            if b["t1"] <= b["t0"]:
                raise ValueError(f"{b['id']} has no duration ({b['t0']:.2f} -> {b['t1']:.2f})")

    def at(self, anchor):
        a = anchor.strip()
        if a.startswith("beat:"):
            t = self.at(a[5:])
            return TICK_START + math.ceil((t - TICK_START) / TICK_PERIOD - 1e-6) * TICK_PERIOD
        m = re.fullmatch(r"(.+?)([+-]\d+(?:\.\d+)?)?", a)
        base, off = m.group(1), float(m.group(2) or 0)
        if base.startswith("@"):
            return float(base[1:]) + off
        if base == "cut":
            return self.tl["cut_to_black"] + off
        if ":" not in base:
            lid, _, edge = base.partition(".")
            return self.lines[lid]["end" if edge == "end" else "start"] + off
        lid, rest = base.split(":", 1)
        word, _, edge = rest.partition(".")
        word, _, occ = word.partition("#")
        hits = [w for w in self.lines[lid]["words"] if norm(w["w"]) == norm(word)]
        w = hits[int(occ or 1) - 1]
        return w["end" if edge == "end" else "start"] + off

    def frame(self, anchor_or_seconds):
        t = anchor_or_seconds if isinstance(anchor_or_seconds, (int, float)) else self.at(anchor_or_seconds)
        return int(round(t * self.fps))

    def phrase_words(self, phrase):
        lid, a, b = phrase["words"]
        return self.lines[lid]["words"][a:b + 1]
