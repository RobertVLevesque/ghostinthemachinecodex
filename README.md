# Ghost in the Machine

Ghost in the Machine is a single-page cinematic puzzle built with React, Vite, Tailwind CSS, Framer Motion, Zustand, and shadcn-inspired primitives. The experience starts deceptively minimal and unfolds into an interactive cipher that awakens a central ghost entity. All progress persists locally so visitors can return to finish the sequence.

## Getting Started

```bash
npm install
npm run dev
```

The development server runs on [http://localhost:5173](http://localhost:5173). Hot Module Replacement is enabled by default.

### Available Commands

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start the Vite dev server. |
| `npm run build` | Type-check and bundle the project for production. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint across the project. |
| `npm run typecheck` | Run TypeScript in no-emit mode. |
| `npm run test` | Execute Vitest with React Testing Library. |

## Project Structure

```
.
├── src
│   ├── components
│   │   ├── Badge.tsx
│   │   ├── CipherNode.tsx
│   │   ├── Ghost.tsx
│   │   ├── HUDHints.tsx
│   │   ├── PulseSweep.tsx
│   │   └── TerminalOverlay.tsx
│   ├── lib
│   │   ├── audio.ts
│   │   ├── gameState.ts
│   │   └── utils.ts
│   ├── styles
│   │   └── globals.css
│   ├── App.tsx
│   └── main.tsx
├── public
│   └── preview.png (optional placeholder for marketing screenshots)
├── index.html
├── package.json
└── ...
```

## Deployment

### GitHub Pages

1. Update the `base` path in `vite.config.ts` if the site will live under a subdirectory.
2. Build the project with `npm run build`.
3. Push the contents of the `dist` folder to a `gh-pages` branch or use a GitHub Action such as [`peaceiris/actions-gh-pages`](https://github.com/peaceiris/actions-gh-pages) to automate the publish step.

### Netlify

1. Connect the repository in the Netlify dashboard.
2. Set the build command to `npm run build` and the publish directory to `dist`.
3. Netlify will handle install, build, and deployment automatically on each push to your chosen branch.

## Customisation

The experience is designed to be easy to tune without rewriting core logic.

- **Node positions**: adjust the Tailwind utility strings in `NODE_POSITIONS` inside `src/App.tsx`.
- **Colour palette & glows**: tweak the `colors`, `boxShadow`, and keyframe definitions in `tailwind.config.ts`.
- **Timings & motion**: edit the delay values in the node visibility effects within `App.tsx`, or update the animation durations in the component files.
- **Audio**: `src/lib/audio.ts` defines the synthesis curves for the `blip` and `surge` sounds. Modify the frequencies, durations, or waveforms to change the sonic profile.

## Accessibility & Performance Notes

- Keyboard navigation order flows from the glyph ➜ triangles ➜ terminal input.
- Reduced-motion preferences disable sweep animations while preserving progression.
- Game state is persisted using `localStorage`; the “Reset Experience” option clears it.
- Audio can be toggled off from the HUD and is generated lazily via the Web Audio API.

Enjoy communing with the ghost.
