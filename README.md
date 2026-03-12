# Ethical Review Builder

AI-powered Google review generator for local service businesses. Users answer guided questions; OpenAI composes a polished, authentic review they can post to Google.

## Tech Stack
- Vite + React 18 + shadcn/ui
- Express.js (Node 20)
- Neon PostgreSQL + Drizzle ORM
- OpenAI API
- Passport.js auth
- Deployed on Vercel

## Local Setup
```bash
npm install
cp .env.example .env
# Fill in DATABASE_URL, OPENAI_API_KEY, SESSION_SECRET
npm run db:push
npm run dev
```

App runs at `http://localhost:5000`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `OPENAI_API_KEY` | OpenAI API key |
| `SESSION_SECRET` | Random 64-char string for sessions |
| `NODE_ENV` | `development` or `production` |
| `PORT` | Local server port (default 5000) |

## Deployment

Deployed on Vercel. Set all env vars in Vercel project settings before deploying.

## License
Private — Jason Valasek / Hello Support
