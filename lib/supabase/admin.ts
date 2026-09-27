import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role client for privileged, server-only operations (e.g. creating
 * users and generating email action links). Never import this into any file
 * that can run in the browser.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
