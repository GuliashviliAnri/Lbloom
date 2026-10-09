// Supabase publishable credentials are public; admin access is enforced by Auth and RLS.
// Keep the selected project's browser configuration available across local rebuilds.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sdmnhcjtppqkmdvkzocm.supabase.co';
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_cfYrbvrSyLHwhW4FbhPg1Q_W_D9PprU';
