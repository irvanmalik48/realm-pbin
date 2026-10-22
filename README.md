# Realm Pastebin

The fast, minimalist code snippet and text sharing service for the Realm platform. Built with Next.js, React, and Tailwind CSS, supporting automatic syntax highlighting, client and server password encryption, and instantaneous sharing.

---

## Features

- Full-Width Code Editor: Line numbers gutter, tab indentation support, drag-and-drop file loading, auto language detection, and keyboard shortcuts (`Ctrl+Enter` to save).
- Multi-Language Syntax Highlighting: Highlighting across 20+ programming languages powered by Shiki with dual GitHub Light and GitHub Dark themes.
- Password Protection & Encryption: Secure sensitive snippets using AES-GCM encryption with Argon2id key derivation.
- Expiration Policies: Configurable snippet lifetimes (1 hour, 1 day, 7 days, or permanent).
- Line Highlighting & Permalinks: Click any line number to anchor and share a direct line link (`#L10`).
- Quick Actions: One-click clipboard copy, direct raw plaintext viewing, and file download.
- Duplicate & Fork: Edit a copy to modify existing snippets without overriding the original.
- Privacy-Preserving Analytics: Client-side telemetry tracker forwarding site domain to `realm-api`.
- Clean Styling & Dark Mode: Tailored dark and light themes with responsive layouts for mobile and desktop screens.
- Zero Login Required: Frictionless creation and instant viewing without mandatory account setup.

---

## Requirements

- Node.js 20 or later
- pnpm 10 or later
- An optional running instance of `realm-api` for persistent backend storage

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/irvanmalik48/realm-pbin.git
cd realm-pbin
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Copy the example configuration file and fill in your settings:

```bash
cp .env.example .env.local
```

Key settings to review:

- `NEXT_PUBLIC_SITE_URL`: Address of this website (for example, `http://localhost:3000`).
- `API_URL`: Address of the backend API server (for example, `http://localhost:8080`).
- `NEXT_PUBLIC_API_URL`: Public address of `realm-api` for client-side requests.

### 4. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Description |
|---|---|
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) |
| `NEXT_PUBLIC_ENVIRONMENT` | Public environment mode indicator (`development`, `production`, `test`) |
| `NEXT_PUBLIC_SITE_NAME` | Name shown in the page header and browser tab |
| `NEXT_PUBLIC_SITE_URL` | Public web address of the site (for example, `https://bin.irvanma.eu.org`) |
| `API_URL` | Base URL of the backend API service (for example, `http://localhost:8080`) |
| `NEXT_PUBLIC_API_URL` | Public HTTP URL of `realm-api` for client-side requests |

---

## Available Scripts

```bash
# Start local development server
pnpm dev

# Build production bundle
pnpm build

# Run production server
pnpm start

# Run linter and formatting checks
pnpm lint

# Run React Doctor health and performance audit
pnpm doctor

# Check TypeScript types
pnpm exec tsc --noEmit
```

---

## License

Licensed under the [Realm Collectives Community License (RCCL) Version 1.0](https://github.com/irvanmalik48/realm-pbin/blob/main/LICENSE).