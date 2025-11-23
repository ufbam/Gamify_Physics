# Gamify Physics

Interactive, mouse-driven physics mini-games that cover movement and waves concepts. Each level unlocks the next once you hit the goal, making it easy to host on GitHub Pages for quick play.

## Play locally

```bash
python -m http.server 3000
# open http://localhost:3000
```

All progress is stored in `localStorage`, so each browser keeps its own unlocks.

## Levels
- **Measure Speed:** drag a runner to set distance, adjust the timer, and aim for a target speed.
- **Acceleration vs. Speed:** stack pushes to raise velocity without overspending pushes.
- **Graph Motion:** tune a constant speed and watch the position-time graph draw itself.
- **Changing Direction:** steer a velocity vector while keeping speed stable.
- **Forces & Friction:** balance friction to glide a puck to the finish flag.
- **Waves & Types:** switch between transverse and longitudinal visuals and set amplitude/wavelength.

## Hosting on GitHub Pages
The site is fully static. Push to a `gh-pages` branch or enable Pages from your repository settings and point it to the root of the repo.
