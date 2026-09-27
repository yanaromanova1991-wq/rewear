"use client"

import { useState } from "react"
import { MessageSquare, Star, Send, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const categories = ["General", "Bug report", "Feature idea", "Dress quality"]

export function FeedbackView() {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [category, setCategory] = useState("General")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const canSubmit = rating > 0 && message.trim().length > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 pb-28 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Thank you!
        </h2>
        <p className="max-w-xs text-pretty text-sm text-muted-foreground">
          Your feedback helps us build the first community-based eventwear
          exchange. We read every note.
        </p>
        <Button
          variant="outline"
          className="mt-2 h-11 font-medium"
          onClick={() => {
            setSubmitted(false)
            setRating(0)
            setCategory("General")
            setMessage("")
          }}
        >
          Send more feedback
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-28 pt-2">
      <div className="flex flex-col items-center gap-2 pt-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
          <MessageSquare className="h-6 w-6 text-foreground" />
        </div>
        <h2 className="font-serif text-lg font-semibold text-foreground">
          We&apos;d love your thoughts
        </h2>
        <p className="max-w-xs text-pretty text-sm text-muted-foreground">
          Help shape the app. Tell us what you love and what we can improve.
        </p>
      </div>

      {/* Rating */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">How&apos;s your experience?</Label>
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`${value} star${value > 1 ? "s" : ""}`}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              className="flex h-11 w-11 items-center justify-center"
            >
              <Star
                className={cn(
                  "h-7 w-7 transition-colors",
                  (hover || rating) >= value
                    ? "fill-accent text-accent"
                    : "text-muted-foreground/40"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Topic</Label>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                category === c
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-foreground hover:bg-secondary"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="feedback-message" className="text-sm font-medium">
          Your feedback
        </Label>
        <Textarea
          id="feedback-message"
          placeholder="Share your thoughts, ideas, or anything that would make Dress Swap better..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-32 resize-none text-base"
        />
      </div>

      <Button
        className="h-12 w-full text-base font-semibold"
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        <Send className="mr-2 h-4 w-4" />
        Submit Feedback
      </Button>
    </div>
  )
}
