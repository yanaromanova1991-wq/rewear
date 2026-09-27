"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

function signUpErrorMessage(code: string | undefined, status: number | undefined): string {
  if (code === "weak_password") return "Please choose a stronger password."
  if (code === "email_address_invalid") {
    return "Please use a real email address — test domains aren't supported."
  }
  if (status === 409) {
    return "An account with this email already exists. Try signing in, or reset your password if you've forgotten it."
  }
  if (status === 429) {
    return "Too many sign-up attempts. Please wait a moment and try again."
  }
  return "Unable to complete sign-up. Please try again."
}

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Passwords don't match.")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          redirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? window.location.origin,
        }),
      })

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: undefined }))
        setError(signUpErrorMessage(error?.code, response.status))
        setIsLoading(false)
        return
      }

      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      console.error("[v0] Sign-up error:", error)
      setError(signUpErrorMessage(undefined, undefined))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <Logo size={72} />
        <p className="text-pretty text-sm text-muted-foreground">
          Join the community and start swapping eventwear.
        </p>
      </div>

      <form onSubmit={handleSignUp} className="flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-12 text-base"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-12 text-base"
            />
          </div>
        </div>
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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
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
          <Label htmlFor="repeat-password">Repeat password</Label>
          <Input
            id="repeat-password"
            type="password"
            required
            autoComplete="new-password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            className="h-12 text-base"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          type="submit"
          className="h-12 w-full text-base"
          disabled={isLoading}
        >
          {isLoading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already a member?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </main>
  )
}
