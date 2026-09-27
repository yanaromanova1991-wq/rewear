import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AuthErrorPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-6 py-10 text-center">
      <div className="mb-6 flex justify-center">
        <Logo size={72} />
      </div>
      <h1 className="text-balance text-xl font-semibold text-foreground">
        Something went wrong
      </h1>
      <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
        That confirmation link may have expired or already been used. Please try
        signing in, or create your account again.
      </p>
      <Button asChild className="mt-8 h-12 text-base">
        <Link href="/auth/login">Back to sign in</Link>
      </Button>
    </main>
  )
}
