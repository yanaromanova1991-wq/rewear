"use client"

import { useEffect, useState } from "react"
import { MessageCircle, Instagram, Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const INVITE_TEXT =
  "Have a friend who might enjoy this app? Invite them now! Help us build the first community-based eventwear exchange. The first 100 members get a \"Founding Member\" tag on their profile."

const SHARE_MESSAGE =
  "I'm using Dress Swap to swap wedding guest dresses with a community of other guests. Join me and the first 100 members get a Founding Member tag! "

export function InviteDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Invite users to share after they've spent a little time in the app.
    const timer = setTimeout(() => setOpen(true), 18000)
    return () => clearTimeout(timer)
  }, [])

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(SHARE_MESSAGE)}`
    window.open(url, "_blank", "noopener,noreferrer")
    setOpen(false)
  }

  const shareInstagram = () => {
    // Instagram has no prefilled-DM web link, so copy the message and open Instagram.
    if (navigator.clipboard) {
      navigator.clipboard.writeText(SHARE_MESSAGE).catch(() => {})
    }
    window.open(
      "https://www.instagram.com/",
      "_blank",
      "noopener,noreferrer"
    )
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15">
            <Sparkles className="h-7 w-7 text-accent" />
          </div>
          <DialogTitle className="font-serif text-xl">
            Invite your friends
          </DialogTitle>
          <DialogDescription className="text-pretty text-sm leading-relaxed">
            {INVITE_TEXT}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 pt-2">
          <Button
            className="h-12 w-full text-base font-semibold"
            onClick={shareWhatsApp}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Invite on WhatsApp
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full text-base font-semibold"
            onClick={shareInstagram}
          >
            <Instagram className="mr-2 h-5 w-5" />
            Invite on Instagram
          </Button>
          <button
            onClick={() => setOpen(false)}
            className="mt-1 text-sm text-muted-foreground underline-offset-2 hover:underline"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
