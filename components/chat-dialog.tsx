"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Send } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useApp } from "@/lib/app-context"
import { cn } from "@/lib/utils"
import type { IncomingLike, OutgoingLike } from "@/lib/types"

interface ChatDialogProps {
  like: IncomingLike | (OutgoingLike & { fromUser: IncomingLike["fromUser"] })
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChatDialog({ like, open, onOpenChange }: ChatDialogProps) {
  const { sendMessage, user } = useApp()
  const [text, setText] = useState("")
  const endRef = useRef<HTMLDivElement>(null)

  const messages = like.messages ?? []

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length, open])

  const handleSend = () => {
    if (!text.trim()) return
    sendMessage(like.id, text)
    setText("")
  }

  const initials = like.fromUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80dvh] flex-col gap-0 p-0">
        <DialogHeader className="flex-row items-center gap-3 border-b border-border px-4 py-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-secondary text-xs font-semibold text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <DialogTitle className="text-left text-sm font-semibold">
              {like.fromUser.name}
            </DialogTitle>
            <span className="text-xs text-muted-foreground">
              Swapping your {like.dress.name}
            </span>
          </div>
        </DialogHeader>

        {/* Item context */}
        <div className="flex items-center gap-3 border-b border-border bg-secondary/40 px-4 py-2.5">
          <div className="relative h-12 w-10 flex-shrink-0 overflow-hidden rounded-md">
            <Image
              src={like.dress.images[0] || "/placeholder.svg"}
              alt={like.dress.name}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-foreground">{like.dress.name}</p>
            <p>{like.dress.brand}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <p className="my-auto text-center text-sm text-muted-foreground">
              Say hello and arrange your swap.
            </p>
          )}
          {messages.map((msg) => {
            const mine = msg.senderId === user.id
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  mine ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                    mine
                      ? "rounded-br-sm bg-foreground text-background"
                      : "rounded-bl-sm bg-secondary text-foreground"
                  )}
                >
                  {msg.text}
                </div>
              </div>
            )
          })}
          <div ref={endRef} />
        </div>

        {/* Composer */}
        <div className="flex items-center gap-2 border-t border-border px-3 py-3">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Type a message..."
            className="h-10"
          />
          <Button
            size="icon"
            className="h-10 w-10 flex-shrink-0"
            onClick={handleSend}
            disabled={!text.trim()}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
