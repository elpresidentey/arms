import { handleCors, json } from '../_shared/cors.ts'
import { HttpError } from '../_shared/errors.ts'
import { readBody } from '../_shared/auth.ts'
import { serviceClient } from '../_shared/db.ts'

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const body = await readBody(req)
    const bootstrapToken = String(body.bootstrapToken ?? '')
    const expected = Deno.env.get('BOOTSTRAP_ADMIN_TOKEN')

    if (!expected) {
      throw new HttpError(503, 'Bootstrap is not configured on this deployment')
    }
    if (bootstrapToken !== expected) {
      throw new HttpError(403, 'Invalid bootstrap token')
    }

    const service = serviceClient()
    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')
    const profileData = {
      firstName: String(body.firstName ?? ''),
      lastName: String(body.lastName ?? ''),
      phoneNumber: String(body.phoneNumber ?? ''),
      address: String(body.address ?? ''),
      ward: String(body.ward ?? ''),
      houseNumber: String(body.houseNumber ?? ''),
      street: String(body.street ?? ''),
    }

    if (!email || !password) {
      throw new HttpError(400, 'Email and password are required')
    }

    const { data: existing } = await service.from('users').select('id').eq('email', email).maybeSingle()
    if (existing) {
      throw new HttpError(400, 'An administrator already exists for this email')
    }

    const { data: authData, error: authError } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { ...profileData, role: 'admin' },
    })

    if (authError || !authData?.user) {
      throw new HttpError(500, authError?.message ?? 'Failed to create authentication user')
    }

    let profile: Record<string, unknown>
    try {
      const { data: updated, error: profileError } = await service
        .from('users')
        .update({
          role: 'admin',
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phoneNumber: profileData.phoneNumber,
          address: profileData.address,
          ward: profileData.ward || 'Unassigned',
          houseNumber: profileData.houseNumber,
          street: profileData.street,
          isActive: true,
        })
        .eq('id', authData.user.id)
        .select('*')
        .single()
      if (profileError) throw new HttpError(500, profileError.message)
      profile = updated
    } catch (error) {
      await service.auth.admin.deleteUser(authData.user.id).catch(() => {})
      throw error
    }

    const { data: sessionData, error: signInError } = await service.auth.signInWithPassword({ email, password })
    if (signInError || !sessionData?.session) {
      throw new HttpError(500, 'Admin created but failed to sign in')
    }

    return {
      access_token: sessionData.session.access_token,
      token: sessionData.session.access_token,
      user: profile,
      message: 'Admin account created successfully',
    }
  } catch (error) {
    if (error instanceof HttpError) {
      return json({ error: error.message }, error.status)
    }
    console.error('admin-bootstrap error:', error)
    return json({ error: 'An unexpected error occurred' }, 500)
  }
})