# Byond Senses — Claude Code Rules

## Project
Immersive web portal. Next.js 16 + React Three Fiber + GLSL. Lives at `D:/claude code/byond-senses/`.

---

## Standard Operating Procedures

### Git commits — ALWAYS use this format
```bash
git add <specific files>
git commit -m "Short descriptive message"
git push origin main
```
- **Never** use `$()` command substitution in commit commands
- **Never** use heredoc `<<'EOF'` in commit commands
- **Never** write to the `.git/` directory directly
- Keep commit messages single-line and under 72 characters
- Stage specific files by name — never `git add -A` or `git add .`

### TypeScript — check before every commit
```bash
npx tsc --noEmit
```
Fix all errors before committing. Zero tolerance for TS errors in main.

### Dev server
Already running on `localhost:3000` if started this session.
To check status: `cat` the task output file — don't restart unless explicitly asked.
Never run `npm run dev` twice — check if already running first.

### Installing packages
```bash
npm install <package>
```
No `--legacy-peer-deps` unless a version conflict is confirmed and user approves.

### File creation order
Always: Write new file → TypeScript check → commit.
Never commit files that haven't been TypeScript-verified.

---

## Architecture

### The global canvas pattern
- `providers/SceneProvider.tsx` — holds `SceneConfig` state
- `components/canvas/Scene.tsx` — R3F Canvas, fixed full-screen, z-index 0
- `hooks/useScene.ts` — every page calls `useScene('pagename')` at top
- Pages never manage their own canvas — they configure the global one

### Adding a new page
1. Create `app/pagename/page.tsx`
2. First line inside component: `useScene('pagename')` or `useScene({ formation: '...', colorTemp: '...' })`
3. Add preset to `types/scene.ts` → `SCENE_PRESETS`
4. Page content sits on top of canvas via `position: relative, z-index > 10`

### Shader changes
GLSL lives in `components/canvas/shaders/*.ts` as exported template literal strings.
No webpack config needed — imported as plain TypeScript strings.

---

## Tech Stack (quick reference)
| Layer | Package |
|---|---|
| Framework | Next.js 16, TypeScript, Tailwind v4 |
| 3D | Three.js, @react-three/fiber, @react-three/drei |
| Shaders | Inline GLSL via TS template literals |
| Post-FX | @react-three/postprocessing |
| Animation | GSAP + Lenis |
| UI motion | Framer Motion |
| Weather | Open-Meteo (no key needed) |
| CMS | @notionhq/client |
| Forms | @emailjs/browser |
| Chat | Tawk.to embed script |
| Hosting | Vercel (hobby) |

---

## Line endings
Windows dev environment. `.gitattributes` handles LF/CRLF — warnings are harmless, not errors.
