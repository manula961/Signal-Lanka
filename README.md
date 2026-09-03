# Signal Lanka v11 — English / Sinhala Edition

A zero-dependency Node.js interactive museum about Sri Lanka's communication journey through **Ancient, Middle and Modern** eras.

## Exhibition attractions

- **Communication Time Machine** — visitors type one message and watch it transform into an Ancient symbolic signal, a Middle-era Morse transmission and a Modern digital packet.
- **60-second Communication Challenge** — three scored tasks, one per era, with a countdown, speed bonus, result rank and copyable exhibition result.
- Existing era labs remain: smoke signals, ola inscription, printing press, Morse and network packet interactions.
- No generated images. Historical archive images remain remote and fail gracefully when unavailable.

## English / Sinhala mode

Use the **සිංහල / English** button in the header to switch the museum interface. The selected language is remembered in the browser. Exhibition attractions, era navigation, labels and core educational content support Sinhala mode.

## Run

```powershell
node server.js
```

Open `http://localhost:3000`.

No `npm install` is required.

## Keyboard

- `1`, `2`, `3` — jump to Ancient, Middle or Modern Era.
- `Esc` — close menu or exhibition experience.
- `Enter` while focused on the Time Machine message input — transmit.
