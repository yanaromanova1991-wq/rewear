import { NextResponse, type NextRequest } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

// Creates the (unconfirmed) Supabase user via the admin API and emails the
// confirmation link ourselves through Resend. This bypasses Supabase's
// built-in mailer entirely, so we avoid its aggressive default rate limits
// and get deliverable email out of the box.
export async function POST(request: NextRequest) {
  const { email, password, firstName, lastName, redirectTo } =
    (await request.json()) as {
      email?: string
      password?: string
      firstName?: string
      lastName?: string
      redirectTo?: string
    }

  if (!email || !password) {
    return NextResponse.json(
      { error: { message: 'Email and password are required.' } },
      { status: 400 },
    )
  }

  const admin = createAdminClient()
  const origin = redirectTo ?? request.nextUrl.origin

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'signup',
    email,
    password,
    options: {
      data: {
        first_name: firstName?.trim() ?? '',
        last_name: lastName?.trim() ?? '',
        full_name: `${firstName?.trim() ?? ''} ${lastName?.trim() ?? ''}`.trim(),
      },
    },
  })

  if (error) {
    const status =
      error.code === 'email_exists' || /already registered|already exists/i.test(error.message)
        ? 409
        : 400
    return NextResponse.json({ error: { message: error.message, code: error.code } }, { status })
  }

  const tokenHash = data.properties?.hashed_token
  if (!tokenHash) {
    return NextResponse.json(
      { error: { message: 'Could not generate a confirmation link.' } },
      { status: 500 },
    )
  }

  const confirmUrl = new URL('/auth/confirm', origin)
  confirmUrl.searchParams.set('token_hash', tokenHash)
  confirmUrl.searchParams.set('type', 'signup')
  confirmUrl.searchParams.set('next', '/')

  const resend = new Resend(process.env.RESEND_API_KEY)
  const fromDomain = process.env.RESEND_EMAIL_DOMAIN
  const from = fromDomain ? `ReWear <onboarding@${fromDomain}>` : 'ReWear <onboarding@resend.dev>'

  const { error: sendError } = await resend.emails.send(
    {
      from,
      to: [email],
      subject: 'Confirm your ReWear account',
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h1 style="font-size: 18px; margin-bottom: 12px;">Welcome to ReWear${firstName ? `, ${firstName}` : ''}!</h1>
          <p style="font-size: 14px; color: #444; line-height: 1.6;">
            Confirm your email to finish creating your account and start swapping eventwear.
          </p>
          <p style="margin: 24px 0;">
            <a href="${confirmUrl.toString()}" style="background: #111; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; display: inline-block;">
              Confirm email
            </a>
          </p>
          <p style="font-size: 12px; color: #888;">
            If the button doesn't work, copy and paste this link into your browser:<br />
            <span style="word-break: break-all;">${confirmUrl.toString()}</span>
          </p>
        </div>
      `,
    },
    { idempotencyKey: `signup-confirmation/${email}` },
  )

  if (sendError) {
    console.error('[v0] Resend send error:', sendError)
    return NextResponse.json(
      { error: { message: 'Account created, but the confirmation email failed to send. Please try again shortly.' } },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
