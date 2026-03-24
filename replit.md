# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: MongoDB + Mongoose (MONGODB_URI env var)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: JWT (jsonwebtoken) for admin sessions

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── examcore-pulse/     # EXAMCORE PULSE React frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection (unused - using MongoDB)
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## EXAMCORE PULSE Project

### Overview
Nigerian exam news website with admin control panel.

### Features
- Public news website: JAMB, WAEC, NECO, GCE, POST-UTME, NABTEB categories
- Like system (heart) with IP-based identification
- View counter (eye icon) per post
- Comments system with auto-generated user profiles by IP
- Multi-image gallery posts (for timetables etc)
- Image upload via `https://rynekoo-api.hf.space/tools/uploader/alibaba`

### Admin Panel
- URL: `/admin/login`
- Email: `apextutors911@gmail.com`
- Password: `Emergency911@`
- Features: Post management, category management, comment moderation, dashboard stats

### Backend Routes
- `GET/POST /api/categories` — categories list and create
- `DELETE /api/categories/:id` — delete category
- `GET/POST /api/posts` — posts list and create
- `GET/PUT/DELETE /api/posts/:id` — single post CRUD
- `POST /api/posts/:id/like` — toggle like
- `GET/POST /api/posts/:id/comments` — comments
- `DELETE /api/comments/:id` — delete comment (admin)
- `POST /api/users/profile` — get/create user profile by IP hash
- `POST /api/admin/login` — admin authentication
- `GET /api/admin/posts` — admin posts list (all statuses)
- `GET /api/admin/stats` — dashboard statistics
- `POST /api/upload` — image upload (proxies to alibaba CDN)

### MongoDB Models
- `Category` — exam categories with name, slug, color
- `Post` — news posts with title, content, images[], likedBy[], views
- `Comment` — comments with IP hash, display name, avatar
- `UserProfile` — visitor profiles keyed by IP hash

### Environment Variables
- `MONGODB_URI` — MongoDB connection string
- `ADMIN_EMAIL` — admin email
- `ADMIN_PASSWORD` — admin password
- `JWT_SECRET` — JWT signing secret
- `IMAGE_UPLOAD_API` — image upload endpoint

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
