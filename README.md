
PCS Realtime Dashboard

This project is ready to deploy to Vercel.

Steps:

1. Create a Supabase account
2. Create a table called 'tasks'

Columns:

id (int8 primary key auto increment)
task (text)
phase (text)
owner (text)
status (text)
priority (text)
notes (text)
done (boolean)

3. In Vercel add environment variables:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

4. Deploy

You now have a live shared PCS planning dashboard.
