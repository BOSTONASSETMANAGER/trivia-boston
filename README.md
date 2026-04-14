# Trivia Boston

Trivia semanal de futbol, economia e historia — desarrollada para **Boston Asset Manager SA** como parte de la campana **Prode Boston Coins - Mundial 2026**.

## Stack

| Tecnologia | Version |
|---|---|
| Next.js (App Router) | 16.2.3 |
| React | 19.2.5 |
| Tailwind CSS | v4 |
| motion/react | 12.x |
| Supabase | @supabase/ssr + supabase-js |
| Vercel Analytics | 2.x |
| TypeScript | 5.x |

## Inicio rapido

```bash
# Instalar dependencias
npm install

# Variables de entorno
cp .env.example .env.local
# Completar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

# Desarrollo (puerto 3334)
npm run dev -- -p 3334

# Build de produccion
npm run build
npm start
```

## Variables de entorno

| Variable | Descripcion |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon/publishable key de Supabase |

## Estructura del proyecto

```
trivia-boston/
├── docs/                          # Documentos markdown (TyC, medallas, etc.)
│   ├── terminos-y-condiciones.md
│   └── medals/
├── public/                        # Assets estaticos
│   ├── favicon.ico
│   ├── logo-boston.png
│   ├── trophy-mundial.png
│   └── manifest.json
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (metadata, viewport, analytics)
│   │   ├── page.tsx               # Pagina principal → TriviaGame
│   │   ├── globals.css            # Tema global, glass cards, utilidades
│   │   ├── actions/               # Server Actions (Supabase)
│   │   │   ├── auth.ts            # registerUser, loginUser
│   │   │   ├── sessions.ts        # saveSession
│   │   │   ├── leaderboard.ts     # getLeaderboard
│   │   │   └── profile.ts         # getUserPublicProfile
│   │   └── docs/                  # Paginas de documentacion (SSR markdown)
│   │       ├── page.tsx           # Indice de docs
│   │       └── [...slug]/page.tsx # Render de cada .md
│   ├── components/
│   │   ├── TriviaGame.tsx         # Orquestador principal de fases
│   │   ├── AuthScreen.tsx         # Login / Registro
│   │   ├── StartScreen.tsx        # Pantalla de inicio (saludo + jugar)
│   │   ├── QuestionCard.tsx       # Pregunta con timer y opciones
│   │   ├── AnswerOption.tsx       # Opcion individual de respuesta
│   │   ├── CountdownTimer.tsx     # Timer circular de 8 segundos
│   │   ├── ProgressDots.tsx       # Indicador de progreso (3 dots)
│   │   ├── ResultsScreen.tsx      # Pantalla de resultados + guardar sesion
│   │   ├── LeaderboardScreen.tsx  # Ranking con podio top-3 + lista
│   │   ├── UserProfileModal.tsx   # Modal de perfil publico (desde ranking)
│   │   ├── ProfileScreen.tsx      # Dashboard de perfil con medallas
│   │   ├── BostonPlusScreen.tsx   # Planes de suscripcion Boston+
│   │   ├── BottomNav.tsx          # Barra de navegacion inferior
│   │   └── StadiumBackground.tsx  # Fondo animado
│   ├── data/
│   │   └── questions.ts           # Preguntas por semana
│   ├── hooks/
│   │   ├── useAuth.ts             # Estado de autenticacion (localStorage)
│   │   ├── useGameState.ts        # Maquina de estados del juego
│   │   └── useCountdown.ts        # Timer regresivo
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── hash.ts            # PBKDF2 password hashing (Web Crypto)
│   │   │   ├── session.ts         # Sesion en localStorage
│   │   │   └── fingerprint.ts     # Fingerprint de dispositivo
│   │   ├── avatar.ts              # Generacion de avatars por usuario
│   │   ├── docs/loader.ts         # Lector de archivos .md desde docs/
│   │   ├── medals/catalog.ts      # Catalogo de medallas (tiers, categorias)
│   │   ├── supabase/
│   │   │   ├── client.ts          # Cliente browser (createBrowserClient)
│   │   │   └── server.ts          # Cliente server (createServerClient)
│   │   └── utils.ts               # Utilidades (cn, clsx, tailwind-merge)
│   └── types/
│       └── game.ts                # Tipos globales (GamePhase, GameState, etc.)
└── package.json
```

## Navegacion y fases del juego

La app es una SPA con navegacion por fases controlada por `useGameState`. El componente `TriviaGame.tsx` orquesta todas las pantallas con `AnimatePresence`.

### Flujo principal

```
AuthScreen (login/registro)
    ↓
StartScreen (saludo + boton "Jugar")
    ↓
QuestionCard x3 (timer 8s por pregunta)
    ↓
ResultsScreen (score + tiempo + guardar en Supabase)
    ↓
  [Ver Ranking]         [Jugar de nuevo]
LeaderboardScreen       → vuelve a StartScreen
```

### Navegacion por tabs (BottomNav)

Disponible una vez autenticado en las fases: `start`, `leaderboard`, `profile`, `bostonplus`, `finished`.

| Tab | Pantalla | Descripcion |
|---|---|---|
| Inicio | `StartScreen` | Saludo con nombre, titulo de la semana, CTA "Jugar" |
| Boston+ | `BostonPlusScreen` | Planes de suscripcion (Freemium, Premium, Premium+) |
| Ranking | `LeaderboardScreen` | Podio top-3 + lista, click para ver perfil |
| Perfil | `ProfileScreen` | Dashboard con medallas, progreso, categorias |

### Fases (`GamePhase`)

| Fase | Pantalla | Descripcion |
|---|---|---|
| `auth` | AuthScreen | Login o registro con email/password |
| `start` | StartScreen | Menu principal |
| `playing` | QuestionCard | Pregunta activa con timer |
| `revealing` | QuestionCard | Revelacion de respuesta correcta |
| `finished` | ResultsScreen | Puntaje final y tiempo total |
| `leaderboard` | LeaderboardScreen | Ranking semanal |
| `profile` | ProfileScreen | Perfil del usuario con medallas |
| `bostonplus` | BostonPlusScreen | Planes de suscripcion |

## Rutas

| Ruta | Tipo | Descripcion |
|---|---|---|
| `/` | Client | App principal (SPA, todas las pantallas) |
| `/docs` | SSR | Indice de documentos markdown |
| `/docs/[...slug]` | SSR | Documento individual (ej: `/docs/terminos-y-condiciones`) |

## Server Actions

| Accion | Archivo | Descripcion |
|---|---|---|
| `registerUser(name, email, password, fingerprint)` | `actions/auth.ts` | Crea usuario con password hasheado (PBKDF2) |
| `loginUser(email, password, fingerprint)` | `actions/auth.ts` | Autentica usuario existente |
| `saveSession(userId, weekNumber, score, totalTimeMs)` | `actions/sessions.ts` | Guarda resultado de partida |
| `getLeaderboard(weekNumber, limit?)` | `actions/leaderboard.ts` | Mejor partida por usuario por semana |
| `getUserPublicProfile(userId, weekNumber)` | `actions/profile.ts` | Perfil publico (stats de partidas) |

## Base de datos (Supabase)

Todas las tablas usan prefijo `trivia_` para aislamiento.

### Tablas

**`trivia_users`** — Usuarios registrados
- `id` (uuid, PK), `name`, `email` (unique), `password_hash`, `created_at`

**`trivia_sessions`** — Partidas completadas
- `id` (uuid, PK), `user_id` (FK → trivia_users), `week_number`, `score` (0-3), `total_time_ms`, `completed_at`

### Vista

**`trivia_leaderboard`** — Mejor partida por usuario por semana (score DESC, time ASC)

### RLS

- Lectura publica para leaderboard
- Insert publico (registro abierto, sin Supabase Auth)
- 1 cuenta por dispositivo (fingerprint)

## Sistema de medallas

Catalogo en `src/lib/medals/catalog.ts` con 6 categorias:

| Categoria | Ejemplos |
|---|---|
| Performance | Partida Perfecta, Sin Errores |
| Streaks | Racha de 3, Racha de 5 |
| Speed | Rayo, Velocista |
| Persistence | Constante, Veterano |
| Milestones | Primera Partida, 10 Partidas |
| Ranking | Top 3, Campeon Semanal |

Tiers: **Bronze** → **Silver** → **Gold** → **Platinum**

## UI Kit

Basado en el UI Kit de Boston Asset Manager:

- **Contenedores**: tarjetas blancas solidas (`bg: #ffffff`, `border: 1px solid #e2e8f0`, `box-shadow: rgba(29,57,105)`)
- **Colores**: Primary `#1d3969`, Accent `#2563eb`, Surface `#f8fafc`
- **Clases CSS**: `.glass-card`, `.glass-card-elevated`, `.boston-cta`, `.boston-title`, `.boston-overline`, `.boston-icon-box`, `.divider-glow`, `.btn-shine`
- **Responsive**: `max-w-sm` mobile → `sm:max-w-lg` → `md:max-w-2xl`/`md:max-w-3xl` desktop
- **Animaciones**: motion/react con `useReducedMotion`, spring transitions, staggered reveals

## Documentacion legal

- [Terminos y Condiciones](/docs/terminos-y-condiciones) — Prode Boston Coins, Mundial 2026

## Deploy

El proyecto esta configurado para deploy en **Vercel** con analytics integrado.

```bash
# Build
npm run build

# El deploy se realiza automaticamente via Vercel Git Integration
```

---

**Boston Asset Manager SA** — Campana Prode Boston Coins, Mundial 2026
