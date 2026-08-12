import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { http } from './errors.ts'
import { userClient } from './db.ts'

export interface Caller {
  uid: string
  email: string | undefined
  authHeader: string
  client: SupabaseClient
}

async function resolveUser(authHeader: string): Promise<{ uid: string; email: string | undefined }> {
  const client = userClient(authHeader)
  const { data: authData, error } = await client.auth.getUser()
  if (error || !authData?.user) {
    throw http(401, 'Invalid or expired session')
  }
  return { uid: authData.user.id, email: authData.user.email }
}

/** Resolve the JWT bearer from a request. */
export function getBearer(req: Request): string {
  const header = req.headers.get('authorization')
  if (!header || !header.startsWith('Bearer ')) {
    throw http(401, 'Authentication required')
  }
  return header
}

/** Require a signed-in user and return their identity (role known via RLS). */
export async function requireUser(req: Request): Promise<Caller> {
  const authHeader = getBearer(req)
  const { uid, email } = await resolveUser(authHeader)
  return { uid, email, authHeader, client: userClient(authHeader) }
}

/** Require a staff (non-resident) user by checking public.get_role() under the JWT. */
export async function requireStaff(req: Request): Promise<Caller> {
  const caller = await requireUser(req)
  const { data: role, error } = await caller.client.rpc('get_role')
  if (error) {
    throw http(500, 'Could not determine user role')
  }
  if (!role || role === 'resident') {
    throw http(403, 'Staff access required')
  }
  return caller
}

/** parse JSON body with a helpful error. */
export async function readBody(req: Request): Promise<Record<string, unknown>> {
  try {
    return await req.json()
  } catch {
    throw http(400, 'Invalid JSON body')
  }
}