import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { http } from './errors.ts'

const url = Deno.env.get('SUPABASE_URL') ?? ''
const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

export function serviceClient(): SupabaseClient {
  const key = Deno.env.get('SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  if (!key) {
    throw http(503, 'Service role key is not configured')
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export function userClient(bearer: string): SupabaseClient {
  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: bearer } },
  })
}