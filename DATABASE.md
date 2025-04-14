# Database Setup for VettAI

This document outlines how to properly set up and maintain the database for VettAI.

## Local Development

1. Make sure PostgreSQL is installed and running
2. Create a database named `VettAI`:
   ```bash
   createdb VettAI
   ```
3. Update the `.env` file with your database credentials
4. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

## Production Setup

For Vercel deployment:

1. Set up a PostgreSQL database (Railway, Supabase, Neon, etc.)
2. Add the `DATABASE_URL` environment variable in Vercel with the connection string
3. Deploy the application - the schema will be pushed automatically

## PostgreSQL vs SQL Server Syntax Issues

If you encounter errors with square brackets in your migrations:

```
ERROR: syntax error at or near "["
```

This means your migrations were created for SQL Server but you're using PostgreSQL. 

Solutions:
1. Use `prisma db push` instead of migrations (current approach)
2. Clean up migrations and recreate them:
   ```bash
   # Delete the migrations folder
   rm -rf prisma/migrations
   
   # Create fresh migrations for PostgreSQL 
   npm run db:migrate:create
   ```

## Manual Database Operations

If you need to push the schema to production manually:

```bash
# Use this when you don't have any sensitive data in your database or during initial setup
npm run db:push

# Use this for proper migrations when you have data to preserve
npm run db:migrate
```

## Troubleshooting

If you encounter "Table does not exist" errors:

1. Check that your DATABASE_URL is correct
2. Run the database push command:
   ```bash
   npx prisma db push --accept-data-loss
   ```
3. If needed, reset the database (will delete all data):
   ```bash
   npx prisma migrate reset
   ```

## Schema Visualization

To see your database schema visually:

```bash
npx prisma studio
```

This will open a web interface where you can explore and edit your data. 