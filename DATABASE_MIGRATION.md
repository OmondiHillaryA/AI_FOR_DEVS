# Database Migration Required

## Add Expiration Column to Polls Table

Run this SQL command in your Supabase SQL Editor:

```sql
ALTER TABLE polls ADD COLUMN expires_at TIMESTAMPTZ;
```

This adds an optional expiration timestamp to polls, enabling:
- Poll expiration functionality
- Visual indicators for expired polls
- Disabled voting on expired polls
- Expiration date picker in forms

## Verification

After running the migration, verify the column was added:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'polls' AND column_name = 'expires_at';
```

Expected result:
- column_name: expires_at
- data_type: timestamp with time zone
- is_nullable: YES