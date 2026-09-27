"use client"

import { useState, useRef, useCallback } from "react"
import Image from "next/image"
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Dress } from "@/lib/types"
import { cn } from "@/lib/utils"
import { imgSrc, isDynamicImage } from "@/lib/images"
import { SWIPE_THRESHOLD } from "@/lib/constants"

const TAP_THRESHOLD = 10

interface SwipeCardProps {
  dress: Dress
  onLike: () => void
  onSkip: () => void
  isTop: boolean
}

export function SwipeCard({ dress, onLike, onSkip, isTop }: SwipeCardProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(
    null
  )
  const [imageIndex, setImageIndex] = useState(0)
  const startPos = useRef({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const images = dress.images
  const hasMultiple = images.length > 1

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      if (!isTop) return
      setIsDragging(true)
      startPos.current = { x: clientX, y: clientY }
    },
    [isTop]
  )

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging || !isTop) return
      const dx = clientX - startPos.current.x
      const dy = clientY - startPos.current.y
      setOffset({ x: dx, y: dy * 0.3 })
    },
    [isDragging, isTop]
  )

  const goToPrev = useCallback(() => {
    setImageIndex((i) => (i > 0 ? i - 1 : images.length - 1))
  }, [images.length])

  const goToNext = useCallback(() => {
    setImageIndex((i) => (i < images.length - 1 ? i + 1 : 0))
  }, [images.length])

  const handleEnd = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging) return
      setIsDragging(false)

      const dx = clientX - startPos.current.x
      const dy = clientY - startPos.current.y

      // Treat as a tap if there was minimal movement
      if (Math.abs(dx) < TAP_THRESHOLD && Math.abs(dy) < TAP_THRESHOLD) {
        if (hasMultiple && cardRef.current) {
          const rect = cardRef.current.getBoundingClientRect()
          const tapX = clientX - rect.left
          if (tapX < rect.width / 2) {
            goToPrev()
          } else {
            goToNext()
          }
        }
        setOffset({ x: 0, y: 0 })
        return
      }

      if (Math.abs(offset.x) > SWIPE_THRESHOLD) {
        const direction = offset.x > 0 ? "right" : "left"
        setExitDirection(direction)
        setTimeout(() => {
          if (direction === "right") {
            onLike()
          } else {
            onSkip()
          }
        }, 300)
      } else {
        setOffset({ x: 0, y: 0 })
      }
    },
    [isDragging, offset.x, onLike, onSkip, hasMultiple, goToPrev, goToNext]
  )

  const rotation = offset.x * 0.1
  const opacity = exitDirection ? 0 : 1 - Math.abs(offset.x) * 0.001

  const likeOpacity = Math.max(0, Math.min(1, offset.x / SWIPE_THRESHOLD))
  const skipOpacity = Math.max(0, Math.min(1, -offset.x / SWIPE_THRESHOLD))

  return (
    <div
      ref={cardRef}
      className={cn(
        "absolute inset-0 touch-none select-none",
        !isTop && "pointer-events-none",
        exitDirection && "pointer-events-none"
      )}
      style={{
        transform: isTop
          ? `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) ${
              exitDirection === "right"
                ? "translateX(120vw)"
                : exitDirection === "left"
                  ? "translateX(-120vw)"
                  : ""
            }`
          : "scale(0.95) translateY(12px)",
        opacity: isTop ? opacity : 0.6,
        transition: isDragging
          ? "none"
          : "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease",
        zIndex: isTop ? 10 : 5,
      }}
      onPointerDown={(e) => {
        e.preventDefault()
        handleStart(e.clientX, e.clientY)
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => handleMove(e.clientX, e.clientY)}
      onPointerUp={(e) => handleEnd(e.clientX, e.clientY)}
      onPointerCancel={(e) => handleEnd(e.clientX, e.clientY)}
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-lg">
        {/* Image */}
        <div className="relative flex-1 overflow-hidden">
          <Image
            src={imgSrc(images[imageIndex])}
            alt={`${dress.brand} ${dress.name} - photo ${imageIndex + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
            priority={isTop}
            loading={isTop ? "eager" : "lazy"}
            fetchPriority={isTop ? "high" : "auto"}
            draggable={false}
            unoptimized={isDynamicImage(images[imageIndex])}
          />

          {/* Photo progress segments */}
          {hasMultiple && (
            <div className="absolute left-0 right-0 top-0 z-20 flex gap-1 p-2">
              {images.map((src, i) => (
                <div
                  key={src + i}
                  className="h-1 flex-1 overflow-hidden rounded-full bg-card/40"
                >
                  <div
                    className={cn(
                      "h-full rounded-full bg-card transition-all",
                      i === imageIndex ? "w-full" : "w-0"
                    )}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Tap indicator arrows */}
          {hasMultiple && isTop && (
            <>
              <div className="pointer-events-none absolute left-2 top-1/2 z-20 -translate-y-1/2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-card/70 backdrop-blur-sm">
                  <ChevronLeft className="h-4 w-4 text-foreground" />
                </div>
              </div>
              <div className="pointer-events-none absolute right-2 top-1/2 z-20 -translate-y-1/2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-card/70 backdrop-blur-sm">
                  <ChevronRight className="h-4 w-4 text-foreground" />
                </div>
              </div>
            </>
          )}

          {/* Swipe overlays */}
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-success/20"
            style={{ opacity: likeOpacity }}
          >
            <div className="rounded-xl border-4 border-success px-6 py-3 text-success">
              <span className="text-3xl font-bold tracking-wide">LIKE</span>
            </div>
          </div>
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-destructive/20"
            style={{ opacity: skipOpacity }}
          >
            <div className="rounded-xl border-4 border-destructive px-6 py-3 text-destructive">
              <span className="text-3xl font-bold tracking-wide">SKIP</span>
            </div>
          </div>

          {/* Top badges */}
          <div className="absolute left-3 top-5 z-20 flex gap-2">
            <Badge
              variant="secondary"
              className="bg-card/90 text-card-foreground backdrop-blur-sm"
            >
              {dress.size}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-card/90 text-card-foreground backdrop-blur-sm"
            >
              {dress.condition}
            </Badge>
          </div>
        </div>

        {/* Info panel */}
        <div className="flex flex-col gap-1.5 p-4">
          <div>
            <h3 className="font-serif text-lg font-semibold leading-tight text-foreground">
              {dress.name}
            </h3>
            <p className="text-sm text-muted-foreground">{dress.brand}</p>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {dress.owner.location}
            </span>
          </div>

          <Badge variant="outline" className="mt-1 w-fit text-xs">
            {dress.dressCode}
          </Badge>
        </div>
      </div>
    </div>
  )
}
