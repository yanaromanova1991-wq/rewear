/**
 * Resolve a stored image reference to a usable <img> src.
 *
 * - Public paths ("/images/dress-1.jpg"), absolute URLs, data: and blob: URLs
 *   are returned unchanged.
 * - Everything else is treated as a private Vercel Blob pathname and served
 *   through our authenticated /api/file route.
 */
export function imgSrc(ref: string | undefined | null): string {
  if (!ref) return "/placeholder.svg"
  if (
    ref.startsWith("http://") ||
    ref.startsWith("https://") ||
    ref.startsWith("/") ||
    ref.startsWith("data:") ||
    ref.startsWith("blob:")
  ) {
    return ref
  }
  return `/api/file?pathname=${encodeURIComponent(ref)}`
}

/** True when the ref must be served dynamically (skip next/image optimization). */
export function isDynamicImage(ref: string | undefined | null): boolean {
  if (!ref) return false
  return (
    ref.startsWith("data:") ||
    ref.startsWith("blob:") ||
    !(
      ref.startsWith("http://") ||
      ref.startsWith("https://") ||
      ref.startsWith("/")
    )
  )
}
