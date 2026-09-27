"use client"

import { useCallback, useEffect, useState } from "react"
import { RefreshCw, X, Heart } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SwipeCard } from "@/components/swipe-card"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/app-context"

export function SwipeFeed() {
  const { user, availableDresses, likeDress, skipDress } = useApp()
  const instructionKey = user?.id ? `discover-instructions-seen:${user.id}` : "discover-instructions-seen"
  const [showInstructions, setShowInstructions] = useState(() => {
    if (typeof window === "undefined") return true
    return window.localStorage.getItem(instructionKey) !== "true"
  })

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage.getItem(instructionKey) === "true") {
      setShowInstructions(false)
    }
  }, [instructionKey])

  const topDress = availableDresses[0]
  const nextDress = availableDresses[1]

  const handleLike = useCallback(() => {
    if (topDress) likeDress(topDress)
  }, [topDress, likeDress])

  const handleSkip = useCallback(() => {
    if (topDress) skipDress(topDress.id)
  }, [topDress, skipDress])

  if (availableDresses.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
          <RefreshCw className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-foreground">
            {"You've seen them all"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Check back soon for new listings or adjust your preferences.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 4rem)" }}
    >
      {/* Card stack — fills the available space so the small action buttons
          stay visible below it without any scrolling. */}
      <div className="relative mx-4 mt-4 min-h-0 flex-1">
        {nextDress && (
          <SwipeCard
            key={nextDress.id}
            dress={nextDress}
            onLike={() => {}}
            onSkip={() => {}}
            isTop={false}
          />
        )}
        {topDress && (
          <SwipeCard
            key={topDress.id}
            dress={topDress}
            onLike={handleLike}
            onSkip={handleSkip}
            isTop={true}
          />
        )}
      </div>

      {/* Action buttons — compact so they stay in view without scrolling */}
      <div className="flex flex-shrink-0 items-center justify-center gap-4 px-4 pb-3 pt-2">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full border border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleSkip}
          aria-label="Skip dress"
        >
          <X className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full border border-accent text-accent hover:bg-accent/10 hover:text-accent"
          onClick={handleLike}
          aria-label="Like dress"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>
    </div>
    <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How Discover works</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Swipe right to request a swap, left to skip. Tap the photo edges to view more photos.</p>
        <DialogFooter>
          <Button onClick={() => {
            window.localStorage.setItem(instructionKey, "true")
            setShowInstructions(false)
          }}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
