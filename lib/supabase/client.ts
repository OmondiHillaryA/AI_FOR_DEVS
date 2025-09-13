import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a secure Supabase browser client with fail-fast environment validation
 * 
 * WHAT: Initializes a Supabase client for browser-side database operations
 * WHY: Centralizes client creation with validation to prevent runtime crashes
 *      that occur when environment variables are missing or misconfigured,
 *      which was causing silent failures and hard-to-debug issues
 * 
 * @returns SupabaseClient - Configured client ready for auth and database operations
 * @throws Error - Immediately fails if environment variables are missing/empty
 * 
 * Security Rationale:
 * - Fail-fast approach prevents app from running with broken configuration
 * - Explicit validation catches deployment issues early
 * - Prevents undefined values from being passed to Supabase SDK
 * 
 * Edge Cases Handled:
 * - Environment variables set to empty strings
 * - Variables undefined in different deployment environments
 * - Whitespace-only environment variable values
 * - Missing .env.local file during development
 * 
 * Required Environment Variables:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL (format: https://xxx.supabase.co)
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous/public key (JWT format)
 * 
 * @example
 * try {
 *   const supabase = createClient();
 *   const { data, error } = await supabase.from('polls').select('*');
 * } catch (error) {
 *   console.error('Supabase setup failed:', error.message);
 *   // Handle gracefully - show user-friendly error
 * }
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // WHY: Explicit validation prevents silent failures and provides clear error messages
  // EDGE CASE: Environment variables can be empty strings, which are truthy but invalid
  // EDGE CASE: Variables might be undefined in different deployment environments
  if (!supabaseUrl || !supabaseKey || supabaseUrl.trim() === '' || supabaseKey.trim() === '') {
    throw new Error(
      'Missing or empty Supabase environment variables. ' +
      'Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    );
  }
  
  return createBrowserClient(supabaseUrl, supabaseKey);
}
