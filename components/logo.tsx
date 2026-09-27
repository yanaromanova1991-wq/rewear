import { cn } from "@/lib/utils"

interface LogoProps {
  /** Reference size in pixels. The wordmark scales from this. */
  size?: number
  className?: string
}

export function Logo({ size = 32, className }: LogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <span
        className="font-serif font-semibold leading-none tracking-tight"
        style={{ fontSize: size * 0.41 }}
      >
        <span className="text-muted-foreground">Re</span>
        <span className="text-brand">wear</span>
      </span>
    </div>
  )
}
