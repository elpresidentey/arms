import { handleCors, json } from '../_shared/cors.ts'
import { HttpError } from '../_shared/errors.ts'
import { requireStaff, readBody } from '../_shared/auth.ts'
import { serviceClient } from '../_shared/db.ts'

interface InviteRow {
  id: string
  tokenHash: string
  email: string
  role: string
  createdByUserId: string
  usedByUserId?: string | null
  expiresAt: string
  usedAt?: string | null
  revokedAt?: string | null
  note?: string | null
  createdAt: string
  updatedAt: string
}

function getStatus(invite: InviteRow): 'active' | 'used' | 'revoked' | 'expired' {
  if (invite.usedAt) return 'used'
  if (invite.revokedAt) return 'revoked'
  if (new Date(invite.expiresAt).getTime() <= Date.now()) return 'expired'
  return 'active'
}

function toView(invite: InviteRow) {
  const { tokenHash: _tokenHash, ...view } = invite
  return { ...view, status: getStatus(invite) }
}

async function sha256(value: string): Promise<string> {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function sendInviteEmail(input: { to: string; inviteLink: string; expiresAt: Date; note?: string | null }): Promise<boolean> {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  const from = Deno.env.get('RESEND_FROM_EMAIL')
  if (!apiKey || !from) return false
  const expires = input.expiresAt.toUTCString()
  const note = input.note ? `<p>Note: ${input.note}</p>` : ''
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: 'You have been invited to join ARMS administration',
      html: `<p>You have been invited to join the ARMS platform as an administrator.</p><p><a href="${input.inviteLink}">Accept invite</a></p><p>This invite expires on ${expires}.</p>${note}`,
    }),
  })
  return response.ok
}

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const body = await readBody(req)
    const action = body.action as string

    switch (action) {
      case 'validate':
        return json(await validateInvite(String(body.email ?? ''), String(body.token ?? '')))
      case 'accept':
        return json(await acceptInvite(body))
      case 'create':
        return json(await createInvite(req, body))
      case 'revoke':
        return json(await revokeInvite(req, String(body.id ?? '')))
      default:
        return json({ error: `Unknown action: ${action}` }, 400)
    }
  } catch (error) {
    if (error instanceof HttpError) {
      return json({ error: error.message }, error.status)
    }
    console.error('admin-invites error:', error)
    return json({ error: 'An unexpected error occurred' }, 500)
  }
})

async function findInvite(service: ReturnType<typeof serviceClient>, token: string): Promise<InviteRow | null> {
  const tokenHash = await sha256(token)
  const { data } = await service.from('admin_invites').select('*').eq('tokenHash', tokenHash).maybeSingle()
  return (data as InviteRow | null) ?? null
}

async function validateInvite(email: string, token: string) {
  const service = serviceClient()
  const normalizedEmail = email.trim().toLowerCase()
  const invite = await findInvite(service, token)
  if (!invite || invite.email !== normalizedEmail || getStatus(invite) !== 'active') {
    throw new HttpError(403, 'Admin invite is invalid or expired')
  }
  return toView(invite)
}

async function acceptInvite(body: Record<string, unknown>) {
  const service = serviceClient()
  const token = String(body.token ?? '')
  const email = String(body.email ?? '').trim().toLowerCase()

  const invite = await findInvite(service, token)
  if (!invite || invite.email !== email || getStatus(invite) !== 'active') {
    throw new HttpError(403, 'Admin invite is invalid or expired')
  }

  const adminData = {
    password: String(body.password ?? ''),
    firstName: String(body.firstName ?? ''),
    lastName: String(body.lastName ?? ''),
    phoneNumber: String(body.phoneNumber ?? ''),
    address: String(body.address ?? ''),
    ward: String(body.ward ?? ''),
    houseNumber: String(body.houseNumber ?? ''),
    street: String(body.street ?? ''),
  }

  if (!adminData.password) throw new HttpError(400, 'Password is required')

  const { data: authData, error: authError } = await service.auth.admin.createUser({
    email,
    password: adminData.password,
    email_confirm: true,
    user_metadata: { ...adminData, role: 'admin' },
  })

  if (authError || !authData?.user) {
    throw new HttpError(500, 'Failed to create authentication user')
  }

  try {
    const { data: profile, error: profileError } = await service
      .from('users')
      .update({
        role: 'admin',
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        phoneNumber: adminData.phoneNumber,
        address: adminData.address,
        ward: adminData.ward || 'Unassigned',
        houseNumber: adminData.houseNumber,
        street: adminData.street,
        isActive: true,
      })
      .eq('id', authData.user.id)
      .select('*')
      .single()
    if (profileError) throw new HttpError(500, profileError.message)

    await service.from('admin_invites').update({ usedAt: new Date().toISOString(), usedByUserId: authData.user.id }).eq('id', invite.id)

    const { data: sessionData, error: signInError } = await service.auth.signInWithPassword({
      email,
      password: adminData.password,
    })
    if (signInError || !sessionData?.session) {
      throw new HttpError(500, 'User created but failed to sign in')
    }

    return {
      access_token: sessionData.session.access_token,
      token: sessionData.session.access_token,
      user: profile,
      message: 'Admin account created successfully via invite',
    }
  } catch (error) {
    await service.auth.admin.deleteUser(authData.user.id).catch(() => {})
    throw error
  }
}

async function createInvite(req: Request, body: Record<string, unknown>) {
  const caller = await requireStaff(req)
  const service = serviceClient()

  const email = String(body.email ?? '').trim().toLowerCase()
  if (!email) throw new HttpError(400, 'Email is required')

  const expiresInHours = Math.max(1, Math.min(168, Math.round(Number(body.expiresInHours ?? 72))))
  const token = randomToken()
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000)

  const { data: invite, error } = await service
    .from('admin_invites')
    .insert({
      tokenHash: await sha256(token),
      email,
      role: 'admin',
      createdByUserId: caller.uid,
      usedByUserId: null,
      expiresAt: expiresAt.toISOString(),
      usedAt: null,
      revokedAt: null,
      note: body.note ? String(body.note).trim() : null,
    })
    .select('*')
    .single()
  if (error) throw new HttpError(500, error.message)

  const frontendUrl = (Deno.env.get('FRONTEND_URL') ?? 'http://localhost:3000').replace(/\/$/, '')
  const inviteLink = `${frontendUrl}/admin/register?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`
  const emailSent = await sendInviteEmail({ to: email, inviteLink, expiresAt, note: invite?.note ?? null })

  return {
    invite: toView(invite as InviteRow),
    token,
    inviteLink,
    emailSent,
  }
}

async function revokeInvite(req: Request, id: string) {
  await requireStaff(req)
  const service = serviceClient()

  const { data: invite, error } = await service.from('admin_invites').select('*').eq('id', id).maybeSingle()
  if (error) throw new HttpError(500, error.message)
  if (!invite) throw new HttpError(404, 'Invite not found')
  if (invite.usedAt) throw new HttpError(400, 'Used invites cannot be revoked')

  const { data: updated, error: updateError } = await service
    .from('admin_invites')
    .update({ revokedAt: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()
  if (updateError) throw new HttpError(500, updateError.message)
  return toView(updated as InviteRow)
}