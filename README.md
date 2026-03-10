# RunningTeamWeb

A team management web app for **Sequoia High School's Cross Country team**. Coaches and runners can view daily practice routes by group, track attendance, and read announcements.

## Features

- **Daily routes** — Home page automatically shows today's route for each group (Varsity, JV, Freshman), with runner assignments and route images. Weekends display a "No practice" message.
- **Announcements** — Coaches can post announcements visible to all members.
- **Attendance tracking** — Log and view attendance per practice.
- **Schedule system** — Weekly schedule maps each group to their route for every day.
- **Role-based access** — 4 roles with separate access codes: Coach, Varsity, JV, Freshman.

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Firebase Firestore (via Admin SDK)
- **Auth:** Cookie-based sessions with role codes

## Deployment

Deploy to [Vercel](https://vercel.com) and add the three Firebase environment variables in your project settings.

## API Routes

| Route | Description |
|---|---|
| `POST /api/auth` | Login with a role code |
| `POST /api/logout` | Clear session |
| `GET /api/schedule` | Fetch weekly schedule |
| `GET /api/announcements` | Fetch announcements |
| `POST /api/attendance` | Log attendance |
| `GET /api/public` | Public route data |
