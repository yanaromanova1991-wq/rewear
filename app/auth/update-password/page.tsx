"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const router = useRouter()

  // The recovery link's code is exchanged for a session in /auth/callback,
  // so by the time we land here the user should be authenticated.
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setHasSession(!!data.user)
      setCheckingSession(false)
    })
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords don't match.")
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      router.push("/")
      router.refresh()
    } catch (error: unknown) {
      console.error("[v0] Update password error:", error)
      const { code } = (error ?? {}) as { code?: string }
      if (code === "weak_password") {
        setError("Please choose a stronger password.")
      } else if (code === "same_password") {
        setError("Your new password must be different from the old one.")
      } else {
        setError("Something went wrong. Please try the reset link again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-3 px-6">
        <Logo size={48} />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </main>
    )
  }

  if (!hasSession) {
    return (
      <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-6 py-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo size={72} />
          <h1 className="text-xl font-semibold text-foreground">
            Reset link expired
          </h1>
          <p className="text-pretty text-sm text-muted-foreground">
            This password reset link is invalid or has expired. Please request a
            new one.
          </p>
        </div>
        <Button asChild className="mt-8 h-12 w-full text-base">
          <Link href="/auth/forgot-password">Request a new link</Link>
        </Button>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <Logo size={72} />
        <h1 className="text-xl font-semibold text-foreground">
          Set a new password
        </h1>
        <p className="text-pretty text-sm text-muted-foreground">
          Choose a new password for your account.
        </p>
      </div>

      <form onSubmit={handleUpdate} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 text-base"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input
            id="confirm"
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="h-12 text-base"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          type="submit"
          className="h-12 w-full text-base"
          disabled={isLoading}
        >
          {isLoading ? "Updating…" : "Update password"}
        </Button>
      </form>
    </main>
  )
}
