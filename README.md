# ResolveAI

AI-powered consumer dispute escalation — upload an airline or e-commerce
dispute, get an analysis + draft escalation message.

This repo holds **three visual variants** of the same UX flow
(Landing → Upload → Processing → Results → Action → Feedback).

| File | Direction | Type | Accent |
| --- | --- | --- | --- |
| `ResolveAI v1.html` | Calm editorial | Instrument Serif + Geist | Muted blue |
| `ResolveAI.html` | Italian editorial | Bodoni Moda + Geist | Vermillion |
| `ResolveAI v3.html` | The Dossier (case file) | Geist only | Judicial navy |

## Run it

There's no build step. Open any of the three HTML files in a browser,
or serve the folder:

```bash
npm start
# → http://localhost:3000
```

Then open one of the three URLs:
- `/ResolveAI v1.html`
- `/ResolveAI.html`
- `/ResolveAI v3.html`

## Structure

```
.
├── ResolveAI v1.html      # v1 entry (uses styles-v1.css + root jsx)
├── ResolveAI.html         # v2 entry (uses styles.css + root jsx)
├── ResolveAI v3.html      # v3 entry (uses v3/*.jsx)
├── styles.css             # v2 stylesheet
├── styles-v1.css          # v1 stylesheet
├── app.jsx                # shared shell (v1, v2)
├── nav.jsx · landing.jsx · upload.jsx · processing.jsx · results.jsx · action.jsx
├── icons.jsx
└── v3/
    ├── styles.css
    ├── nav.jsx · landing.jsx · upload.jsx · processing.jsx · results.jsx · action.jsx
    └── app.jsx
```

React 18 + Babel Standalone are loaded from `unpkg` via `<script>` tags;
nothing to install.

## Notes

- Mobile-first responsive across all three variants.
- No backend — all "analysis" is mocked client-side.
- No account, no tracking.
