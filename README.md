# DevNotes

Terminal-styled markdown note-taking app with tag filtering, full-text search, and pin support. Sign in with GitHub to sync notes to Supabase — works offline with local storage as a guest fallback. Part of the **DevEco** ecosystem — twelve connected developer tools, one unified Supabase backend.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Auth + DB | Supabase (GitHub OAuth + Postgres) |
| Icons | React Icons (Remix set) |
| Font | JetBrains Mono |

---

## Features

- **Markdown editor** — full markdown support with live preview
- **Tag system** — color-coded tags with multi-tag filtering
- **Full-text search** — search across titles and tags instantly
- **Mac-card UI** — notes displayed as macOS-style terminal windows
- **Guest mode** — works without login using local storage fallback
- **Cloud sync** — sign in with GitHub to persist notes to Supabase
- **Single-login SSO** — shared auth with the DevFolio ecosystem, no re-login required

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3006](http://localhost:3006).

### Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_DEVFOLIO_URL=https://your-devfolio-url.vercel.app
```

### Supabase setup

1. Run the shared `schema.sql` from the DevFolio repo in the Supabase SQL Editor
2. Enable GitHub provider in **Authentication → Providers**
3. Add `http://localhost:3006/api/auth/callback` to **Authentication → URL Configuration → Redirect URLs**

---

## Routes

| Route | Description |
|---|---|
| `/` | All notes grid with search and tag filter |
| `/note/[id]` | Note viewer and editor |
| `/note/new` | Create a new note |
| `/api/auth/callback` | OAuth callback — redeems SSO ticket or exchanges code |

---

## Project Structure

```
DevNotes/
├── app/
│   ├── layout.tsx               # root layout — fonts, navbar
│   ├── page.tsx                 # notes grid with search
│   ├── globals.css              # design tokens
│   ├── note/
│   │   ├── new/page.tsx         # new note editor
│   │   └── [id]/page.tsx        # note viewer / editor
│   └── api/auth/
│       └── callback/route.ts    # SSO ticket redemption + OAuth callback
├── components/
│   ├── layout/                  # Navbar
│   └── auth/                    # AuthButton
├── lib/
│   ├── supabase.ts              # browser Supabase client
│   ├── supabase-server.ts       # server Supabase client (cookie-based)
│   └── db.ts                    # notes CRUD — Supabase + localStorage fallback
├── middleware.ts                 # session refresh on every request
└── proxy.ts                     # underlying session middleware handler
```

---

## DevEco Ecosystem

DevNotes is part of a twelve-app ecosystem sharing one Supabase project and one GitHub login.

| App | Description |
|---|---|
| **DevFolio** | Developer portfolio hub — central auth provider |
| **DevBlog** | Write & publish dev posts |
| **DevResume** | Generate PDF resume |
| **DevRoadmap** | Skill learning tracks |
| **DevCalendar** | Schedule & goals |
| **DevTimer** | Pomodoro focus timer |
| **DevNotes** | Markdown notes — this repo |
| **DevStatus** | Project status pages |
| **DevEnv** | Environment vault |
| **DevWidgets** | Embeddable widgets |
| **DevShare** | Share & showcase code snippets |
| **DevPulse** | Dev activity & pulse tracker |

---

## Design System

Terminal / Linux / GitHub-inspired aesthetic.

| Token | Hex | Use |
|---|---|---|
| `bg` | `#05070F` | scaffold background |
| `surface` | `#0B1020` | nav, cards |
| `neon-cyan` | `#00E5FF` | primary accents |
| `neon-green` | `#00FFA3` | success, `$` prompt |
| `neon-blue` | `#4D8CFF` | secondary |
| `neon-purple` | `#8A5BFF` | tag accents |
| `neon-red` | `#FF3D71` | errors, destructive |
| `neon-amber` | `#FFB547` | warnings |

---

## Roadmap

- [x] Notes grid with mac-card UI
- [x] Markdown editor with preview
- [x] Tag system with color coding
- [x] Full-text search
- [x] localStorage fallback for guests
- [x] Supabase cloud sync for authenticated users
- [x] SSO with DevFolio ecosystem
- [ ] Pin notes to top
- [ ] Export notes as `.md` files
- [ ] Note sharing via public link

---

## License

MIT