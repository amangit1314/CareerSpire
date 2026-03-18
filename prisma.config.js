import 'dotenv/config';

export default {
    datasource: {
        // Use DIRECT_URL for migrations (bypasses Supabase connection pooler)
        url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
}
