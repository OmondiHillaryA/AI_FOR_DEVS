# New Poll

Minimal poll creation functionality following project rules.

## Setup

1. Copy `.env.example` to `.env.local` and add your Supabase credentials
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`

## Structure

- `/src/app/polls/create/page.tsx` - Poll creation page (Server Component)
- `/src/components/CreatePollForm.tsx` - Poll form (Client Component)  
- `/src/lib/actions/polls.ts` - Server Actions for poll operations
- `/src/lib/supabase/` - Supabase client and auth helpers

## Features

- Create polls with title, description, and 2-10 options
- Server-side validation and authentication
- Redirect to `/polls` after successful creation