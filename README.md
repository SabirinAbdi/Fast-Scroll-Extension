# Fast-Scroll-Extension

A tiny browser extension for X (Twitter). One button scrolls your **History** page
down at full speed, loading new posts as it goes. Press it again and it stops.

> X renamed Bookmarks to **History** — this works on both, so no worries either way.

## Get the code

**Clone it:**

```bash
git clone https://github.com/SabirinAbdi/Fast-Scroll-Extension.git
```

**Or download the ZIP:**

[https://github.com/SabirinAbdi/Fast-Scroll-Extension](https://github.com/SabirinAbdi/Fast-Scroll-Extension)

Click the green `<> Code` button → `Download ZIP`.

## Run it locally

No build, no install, nothing to figure out. Just load it into your browser.

1. **Open your extensions page** in Chrome, Edge, or Brave:
   ```
   chrome://extensions
   ```

2. **Turn on Developer mode** — toggle in the top-right corner.

3. **Click "Load unpacked"** and pick the repo folder — the one with `manifest.json`
   sitting directly inside it.

4. **Open X → History** and press **Scroll ↓**. The box scrolls the timeline down.
   Press it again (now it says **Stop**) whenever you want it to halt.

> If you get a "Manifest file is missing" error, you picked the wrong folder. Pick the
> one that contains `manifest.json` directly — not the ZIP, not a parent folder.

## That's it

The whole extension is just `manifest.json` and `content.js`. The box can be dragged
around by its header, and the ✕ closes it.

If it pauses while loading more posts, just let it run — it'll pick back up the moment
the posts arrive.

Nothing leaves your browser. It only reads the X page you're already on.
