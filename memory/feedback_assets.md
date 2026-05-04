---
name: User handles image assets manually
description: When implementing UI from Figma, do not download or embed image assets — use grey placeholders instead. The user adds the real assets themselves.
type: feedback
---

When converting Figma designs that include image assets (illustrations, photos, thumbnails), do NOT download Figma's remote URLs to local assets and do NOT embed them as remote URIs. Use plain grey background placeholder views (e.g., `backgroundColor: "#E8E9ED"` or similar muted neutral) sized to match the design.

**Why:** The user prefers to add image assets themselves. Downloading Figma URLs creates fragile dependencies (they expire after ~7 days) and adds binaries to the repo without their input.

**How to apply:** For any non-icon image (illustrations, photos, thumbnails) in a Figma design, render a styled `<View>` with a neutral grey background at the design's dimensions and rounded corners. Use a noticeably-saturated grey like `#C5C8CF` rather than a near-white tint — the user has previously asked for darker placeholders to make them legible at a glance. SVG icons drawn inline in code are fine — only skip raster image assets.
