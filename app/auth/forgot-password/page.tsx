"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    try {
      // Route the reset link through the v0 redirect proxy so the emailed
      // link reaches the preview, then on to the update-password screen.
      const base =
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
        `${window.location.origin}/auth/callback`
      const redirectUrl = new URL(base)
      redirectUrl.searchParams.set("next", "/auth/update-password")

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl.toString(),
      })
      if (error) throw error
      // Always show success to avoid leaking whether an account exists.
      setSent(true)
    } catch (error: unknown) {
      console.error("[v0] Password reset error:", error)
      const { status } = (error ?? {}) as { status?: number }
      if (status === 429) {
        setError("Too many requests. Please wait a moment and try again.")
      } else {
        // Don't reveal account existence — treat other errors as success.
        setSent(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-6 py-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo size={72} />
          <h1 className="text-xl font-semibold text-foreground">
            Check your inbox
          </h1>
          <p className="text-pretty text-sm text-muted-foreground">
            If an account exists for{" "}
            <span className="font-medium text-foreground">{email}</span>,
            we&apos;ve sent a link to reset your password. It may take a minute
            to arrive.
          </p>
        </div>
        <Button asChild variant="outline" className="mt-8 h-12 w-full text-base">
          <Link href="/auth/login">Back to sign in</Link>
        </Button>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <Logo size={72} />
        <h1 className="text-xl font-semibold text-foreground">
          Reset your password
        </h1>
        <p className="text-pretty text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a link to set a new password.
        </p>
      </div>

      <form onSubmit={handleReset} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@email.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 text-base"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          type="submit"
          className="h-12 w-full text-base"
          disabled={isLoading}
        >
          {isLoading ? "Sending link…" : "Send reset link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Back to sign in
        </Link>
      </p>
    </main>
  )
}
