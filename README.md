# Family Bridge

A private SaaS platform for families to connect, communicate, and celebrate together.

## Architecture

```
bridge-11/
├── apps/
│   ├── api/          # NestJS backend (REST + WebSocket)
│   └── web/          # Next.js 14 frontend
├── docker-compose.yml
└── package.json      # npm workspaces root
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS, Zustand, TanStack Query, React Flow |
| Backend | NestJS, TypeORM, PostgreSQL |
| Auth | JWT (access + refresh tokens), bcrypt |
| Realtime | Socket.io (WebSocket gateway) |
| File storage | Local disk (S3-ready) |
| Docs | Swagger / OpenAPI |

## Modules

| # | Module | Description |
|---|--------|-------------|
| 1 | Auth | Registration, login, JWT, refresh tokens |
| 2 | Users | Profiles, avatar upload, search |
| 3 | Families | Multi-family support, invitations, roles |
| 4 | Family Tree | Interactive graph with React Flow, relation edges |
| 5 | Events | Create/RSVP events with participant tracking |
| 6 | Chat | Real-time group messaging via WebSocket |
| 7 | Media | Photo/video albums with upload |
| 8 | Polls | Family voting with live results |
| 9 | Contributions | Collective fundraising with pledge tracking |
| 10 | Notifications | In-app notifications for all actions |
| 11 | Feed | Family social wall with posts, likes, comments |

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose

### Development

```bash
# 1. Clone & install
npm install

# 2. Start database
docker-compose up postgres -d

# 3. Configure environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

# 4. Start both apps
npm run dev
```

- API: http://localhost:3001
- Web: http://localhost:3000
- Swagger: http://localhost:3001/api/docs

### Production (Docker)

```bash
docker-compose up --build
```

## API Reference

Full Swagger docs available at `/api/docs` when the API is running.

### Key Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
GET    /api/auth/me

GET    /api/families
POST   /api/families
GET    /api/families/:id/members
POST   /api/families/:id/members

GET    /api/families/:id/tree
POST   /api/families/:id/tree/relations

GET    /api/families/:id/events
POST   /api/families/:id/events
POST   /api/families/:id/events/:eventId/respond

GET    /api/families/:id/chat/groups
GET    /api/families/:id/chat/groups/:groupId/messages

GET    /api/families/:id/polls
POST   /api/families/:id/polls/:pollId/vote

GET    /api/families/:id/contributions
POST   /api/families/:id/contributions/:id/pledge

GET    /api/notifications
```

### WebSocket (Chat)

```
Namespace: /chat
Auth:      handshake.auth.token (JWT)

Emit:
  join_group   { groupId }
  send_message { groupId, content }
  typing       { groupId, isTyping }

Listen:
  new_message  Message
  user_typing  { userId, isTyping }
```

## Database Schema

19 entities: User, Family, FamilyMember, FamilyRelation, Event, EventParticipation,
ChatGroup, Message, Post, Comment, Like, Album, Media, Poll, PollVote,
Contribution, ContributionPayment, Notification.

TypeORM `synchronize: true` is enabled in development — migrations are auto-generated.

## Environment Variables

See `.env.example` for the full list. Key variables:

```env
DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME
JWT_SECRET, JWT_REFRESH_SECRET
FRONTEND_URL
AWS_S3_BUCKET  (optional — uses local disk by default)
SMTP_HOST, SMTP_USER, SMTP_PASS  (optional — for email notifications)
```

## Roadmap

- **Phase 2**: Push notifications, email digests, Stripe integration for contributions
- **Phase 3**: AI suggestions (event ideas, birthday reminders), family analytics
