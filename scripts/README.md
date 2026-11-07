# scripts/

| File | Purpose |
| --- | --- |
| [demo-scenario.mjs](demo-scenario.mjs) | Records the demo. Runs the real extension, native host, and CLI |
| [demo/stage.html](demo/stage.html) | The page being filmed: a real shell, live `chrome.tabs` data, and the real side panel |
| [demo/build.sh](demo/build.sh) | Turns the recording into `demo.mp4`, three feature clips, and a poster |
| [../brand/og.html](../brand/og.html) | Source for `public/og.png` |

## Recording the demo

Nothing here touches your own Chrome or `dock.sock`. The script copies the committed extension, host, and CLI from an Artifact Dock checkout, then runs them in headless Chromium with a separate profile and socket. No window appears.

```bash
brew install ffmpeg
python3 -m pip install --user pillow
git clone --depth 1 https://github.com/connerkward/screenstudio-alternative-skill /tmp/ssalt
npx playwright install chromium

node scripts/demo-scenario.mjs ./demo-out ~/Downloads/artifact-dock
scripts/demo/build.sh ./demo-out
cp demo-out/web/*.mp4 demo-out/web/demo-poster.png public/
```

Headless recording can't capture the browser's tab bar, so the stage shows tab state from the `chrome.tabs` API. The English UI comes from removing the other locale folders in the temporary copy. The last 2.5 seconds are the recording of the reopened document tab itself, because that tab covers the stage once it's active.
