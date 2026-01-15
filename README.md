## Backend: Powered by Convex

This project has been migrated from Supabase to **Convex**.

### Features
- **Database & Functions**: Convex DB with real-time queries and mutations.
- **Authentication**: [Better Auth](https://better-auth.com) integrated with Convex.
- **Email**: [Resend](https://resend.com) for authentication and transaction emails.
- **Payments**: [Polar](https://polar.sh) integration for subscriptions.

### Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start Convex development**:
   ```bash
   npx convex dev
   ```

3. **Start Next.js**:
   ```bash
   npm run dev
   ```

### Environment Variables
Ensure the following are set in your `.env.local`:
- `NEXT_PUBLIC_CONVEX_URL`: Your Convex deployment URL.
- `BETTER_AUTH_SECRET`: Secret for auth session encryption.
- `RESEND_API_KEY`: For sending emails.
