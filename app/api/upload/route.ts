import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  // Only authenticated members may upload photos.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    const allowedTypes = new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ])
    if (!allowedTypes.has(file.type)) {
      return NextResponse.json(
        { error: "Use a JPEG, PNG, WebP, or HEIC image" },
        { status: 400 }
      )
    }
    // 10MB cap
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large" }, { status: 400 })
    }

    // Namespace uploads per user, with a random suffix to avoid collisions.
    const ext = file.name.split(".").pop() || "jpg"
    const pathname = `dresses/${user.id}/${crypto.randomUUID()}.${ext}`

    const blob = await put(pathname, file, { access: "private" })

    // Private blobs are served through /api/file, so return the pathname.
    return NextResponse.json({ pathname: blob.pathname })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
