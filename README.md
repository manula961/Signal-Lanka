# Signal Lanka v12 — English / Sinhala Exhibition Edition

Signal Lanka is a zero-dependency Node.js interactive museum about Sri Lanka's communication journey through **Ancient, Middle and Modern** eras.

## Exhibition experiences

- **Communication Time Machine** — visitors type one message and watch it transform into an Ancient symbolic signal, a Middle-era Morse/Unicode representation and a Modern UTF-8 packet view.
- **60-second Communication Challenge** — three scored tasks, one per era, with a countdown, speed bonus, result rank and copyable result.
- Era labs include smoke signals, Morse input and a network packet simulation.
- Historical archive photographs include descriptive captions and graceful in-page fallbacks when a remote image cannot load.

## English / Sinhala mode

Use the **සිංහල / English** button in the header to switch the museum interface. The selected language is remembered in the browser. Core navigation, detailed era descriptions, artifact captions, fact panels, exhibition interactions and challenge questions support both languages.

## Accessibility

- Skip-to-content link.
- Visible keyboard focus states.
- Accessible modal dialogs with focus trapping and focus restoration.
- Escape closes an open exhibition dialog.
- Reduced-motion preferences are respected.
- Important interactive outputs use live regions.

## Run

```powershell
node server.js
```

Open `http://localhost:3000`.

No `npm install` is required.

Optional syntax check:

```powershell
npm run check
```

## Keyboard

- `1`, `2`, `3` — jump to Ancient, Middle or Modern Era when no dialog/input is active.
- `Esc` — close the current exhibition dialog.
- `Enter` while focused on the Time Machine message input — transmit.
- `Tab` / `Shift+Tab` — move through controls; focus is trapped inside open dialogs.

## Server behavior

The built-in Node server supports GET/HEAD, correct asset 404 responses, SPA route fallback, malformed-URL handling, path containment checks and security headers including CSP, Referrer-Policy and Permissions-Policy.

## Archive images

The current exhibition references public remote archive images from external hosts. If one fails, Signal Lanka replaces it with a readable placeholder instead of leaving a broken image. For a fully offline exhibition installation, mirror appropriately licensed source images into `public/assets/` and update the corresponding `src` paths while retaining attribution/licensing information.
