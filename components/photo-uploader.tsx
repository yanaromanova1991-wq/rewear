"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Camera, ImagePlus, Info, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { imgSrc, isDynamicImage } from "@/lib/images"

interface PhotoUploaderProps {
  /** Stored image references — Vercel Blob pathnames (or public paths). */
  images: string[]
  onChange: (images: string[]) => void
  max?: number
  /** Minimum photos required (front, back, close-up). */
  min?: number
  showTips?: boolean
  className?: string
}

async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size <= 1_500_000) return file
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const context = canvas.getContext("2d")
  if (!context) return file
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82))
  return blob ? new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" }) : file
}

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", await compressImage(file))
  const res = await fetch("/api/upload", { method: "POST", body: formData })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error || "Upload failed")
  }
  const data = (await res.json()) as { pathname: string }
  return data.pathname
}

export function PhotoUploader({
  images,
  onChange,
  max = 4,
  min = 3,
  showTips = true,
  className,
}: PhotoUploaderProps) {
  const galleryRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const remaining = max - images.length

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)
    const toUpload = Array.from(files).slice(0, remaining)
    setUploading((n) => n + toUpload.length)
    try {
      const pathnames = await Promise.all(toUpload.map(uploadFile))
      onChange([...images, ...pathnames].slice(0, max))
    } catch (err) {
      console.error("[v0] Photo upload error:", err)
      setError("Couldn't upload that photo. Please try again.")
    } finally {
      setUploading((n) => Math.max(0, n - toUpload.length))
    }
  }

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx))
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Hidden inputs: gallery (multi) + camera capture */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          void handleFiles(e.target.files)
          e.target.value = ""
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          void handleFiles(e.target.files)
          e.target.value = ""
        }}
      />

      {/* Thumbnails */}
      {(images.length > 0 || uploading > 0) && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((src, idx) => (
            <div
              key={src.slice(0, 40) + idx}
              className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary"
            >
              <Image
                src={imgSrc(src) || "/placeholder.svg"}
                alt={`Photo ${idx + 1}`}
                fill
                className="object-cover"
                sizes="25vw"
                unoptimized={isDynamicImage(src)}
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-foreground"
                aria-label={`Remove photo ${idx + 1}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {Array.from({ length: uploading }).map((_, i) => (
            <div
              key={`uploading-${i}`}
              className="flex aspect-[3/4] items-center justify-center rounded-lg bg-secondary"
            >
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      {remaining > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            disabled={uploading > 0}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-secondary/50 px-3 py-4 text-foreground transition-colors hover:border-foreground/40 disabled:opacity-50"
          >
            <Camera className="h-5 w-5" />
            <span className="text-xs font-medium">Take photo</span>
          </button>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            disabled={uploading > 0}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-secondary/50 px-3 py-4 text-foreground transition-colors hover:border-foreground/40 disabled:opacity-50"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-xs font-medium">Add photos</span>
          </button>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {images.length < min && (
        <p className="text-xs font-medium text-foreground">
          {`Add at least ${min} photos — one front, one back, and a close-up`}
          {images.length > 0 ? ` (${min - images.length} to go).` : "."}
        </p>
      )}

      {showTips && (
        <div className="flex items-start gap-1.5 rounded-lg bg-background/80 px-3 py-2">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
          <div className="text-[11px] leading-relaxed text-muted-foreground">
            <p>{`Required: a front view, a back view, and one close-up.`}</p>
            <p>Use a light, consistent background for each shot.</p>
            <p>If there are any damages, please photograph them too.</p>
          </div>
        </div>
      )}
    </div>
  )
}
