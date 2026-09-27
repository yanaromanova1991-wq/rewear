"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import {
  Check,
  X,
  Sparkles,
  MessageCircle,
  Truck,
  Repeat2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApp } from "@/lib/app-context"
import { ChatDialog } from "@/components/chat-dialog"
import { ShippingLabelDialog } from "@/components/shipping-label-dialog"
import type { IncomingLike } from "@/lib/types"
import { imgSrc, isDynamicImage } from "@/lib/images"

function MutualBadge() {
  return (
    <Badge className="gap-1 bg-accent text-accent-foreground text-[10px]">
      <Sparkles className="h-3 w-3" />
      Match
    </Badge>
  )
}

export function RequestsView() {
  const {
    incomingLikes,
    outgoingLikes,
    isMutualWithUser,
    acceptIncoming,
    declineIncoming,
    canStartSwap,
    availableSwaps,
  } = useApp()

  const [activeTab, setActiveTab] = useState("incoming")
  const [chatLike, setChatLike] = useState<(IncomingLike | (typeof outgoingLikes[number] & { fromUser: IncomingLike["fromUser"] })) | null>(null)
  const [labelLike, setLabelLike] = useState<IncomingLike | null>(null)

  // mutual matches first, then by recency
  const visibleIncoming = useMemo(
    () => incomingLikes.filter((like) => like.status !== "declined"),
    [incomingLikes]
  )
  const visibleOutgoing = useMemo(
    () => outgoingLikes.filter((like) => like.status !== "declined"),
    [outgoingLikes]
  )

  const sortedIncoming = useMemo(() => {
    return [...visibleIncoming].sort((a, b) => {
      const am = isMutualWithUser(a.fromUser.id) ? 1 : 0
      const bm = isMutualWithUser(b.fromUser.id) ? 1 : 0
      if (am !== bm) return bm - am
      return b.createdAt.localeCompare(a.createdAt)
    })
  }, [visibleIncoming, isMutualWithUser])

  const sortedOutgoing = useMemo(() => {
    return [...visibleOutgoing].sort((a, b) => {
      const am = isMutualWithUser(a.dress.owner.id) ? 1 : 0
      const bm = isMutualWithUser(b.dress.owner.id) ? 1 : 0
      if (am !== bm) return bm - am
      return b.createdAt.localeCompare(a.createdAt)
    })
  }, [visibleOutgoing, isMutualWithUser])

  // sync open dialog state with latest context data
  const liveChatLike = chatLike
    ? (incomingLikes.find((l) => l.id === chatLike.id) ??
      (() => {
        const outgoing = outgoingLikes.find((l) => l.id === chatLike.id)
        return outgoing ? { ...outgoing, fromUser: outgoing.dress.owner } : null
      })() ??
      chatLike)
    : null
  const liveLabelLike = labelLike
    ? incomingLikes.find((l) => l.id === labelLike.id) ?? null
    : null

  const pendingIncoming = incomingLikes.filter(
    (l) => l.status === "pending"
  ).length

  return (
    <div className="flex flex-1 flex-col">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-1 flex-col"
      >
        <div className="px-4">
          <TabsList className="w-full">
            <TabsTrigger value="incoming" className="flex-1">
              Incoming
              {pendingIncoming > 0 && (
                <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                  {pendingIncoming}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="flex-1">
              Outgoing
              {visibleOutgoing.length > 0 && (
                <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground">
{visibleOutgoing.length}
              </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* INCOMING */}
        <TabsContent value="incoming" className="flex-1 px-4 pb-24">
          {!canStartSwap && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-secondary/60 px-3 py-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-foreground" />
              <p className="text-xs text-muted-foreground">
                You&apos;ve swapped all the dresses you listed. List another
                dress in Upload to accept new swaps.
              </p>
            </div>
          )}

          {sortedIncoming.length === 0 ? (
            <EmptyState label="No incoming requests yet." />
          ) : (
            <div className="flex flex-col gap-3 pt-4">
              {sortedIncoming.map((like) => {
                const mutual = isMutualWithUser(like.fromUser.id)
                return (
                  <div
                    key={like.id}
                    className="flex flex-col gap-3 rounded-xl bg-card p-3 shadow-sm"
                  >
                    <div className="flex gap-3">
                      <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={imgSrc(like.dress.images[0])}
                          alt={like.dress.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                          unoptimized={isDynamicImage(like.dress.images[0])}
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-semibold text-foreground">
                            {like.fromUser.name}
                          </h3>
                          {mutual && <MutualBadge />}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Wants your {like.dress.name}
                        </p>
                        {like.status === "declined" && (
                          <Badge
                            variant="secondary"
                            className="mt-0.5 w-fit gap-1 text-[10px]"
                          >
                            <X className="h-3 w-3" />
                            Declined
                          </Badge>
                        )}
                        {like.myLabel && (
                          <Badge
                            variant="secondary"
                            className="mt-0.5 w-fit gap-1 bg-success/15 text-[10px] text-success"
                          >
                            <Truck className="h-3 w-3" />
                            Label ready
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {like.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="h-8 flex-1 text-xs"
                          onClick={() => acceptIncoming(like.id)}
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 flex-1 text-xs"
                          onClick={() => declineIncoming(like.id)}
                        >
                          <X className="mr-1 h-3 w-3" />
                          Decline
                        </Button>
                      </div>
                    )}

                    {(like.status === "accepted" ||
                      like.status === "completed") && (
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-full text-xs"
                            onClick={() => {
                              const key = `shipping-terms-read:${like.id}`
                              if (typeof window !== "undefined" && !sessionStorage.getItem(key)) {
                                setLabelLike(like)
                              } else {
                                setChatLike(like)
                              }
                            }}
                          >
                            <MessageCircle className="mr-1 h-3 w-3" />
                            Message
                          </Button>
                        </div>
                        {!like.myLabel && !canStartSwap && (
                          <p className="text-[11px] text-muted-foreground">
                            List another dress to unlock this swap.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* OUTGOING */}
        <TabsContent value="outgoing" className="flex-1 px-4 pb-24">
          {sortedOutgoing.length === 0 ? (
            <EmptyState label="No outgoing requests yet. Swipe right to send one." />
          ) : (
            <div className="flex flex-col gap-3 pt-4">
              {sortedOutgoing.map((like) => {
                const mutual = isMutualWithUser(like.dress.owner.id)
                return (
                  <div
                    key={like.id}
                    className="flex gap-3 rounded-xl bg-card p-3 shadow-sm"
                  >
                    <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={like.dress.images[0] || "/placeholder.svg"}
                        alt={like.dress.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-semibold text-foreground">
                          {like.dress.name}
                        </h3>
                        {mutual && <MutualBadge />}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        From {like.dress.owner.name}
                      </p>
                      {mutual ? (
                        <p className="mt-0.5 text-xs font-medium text-accent-foreground">
                          It&apos;s a match — check Incoming to message and swap.
                        </p>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="mt-0.5 w-fit text-[10px]"
                        >
                          Waiting for a match
                        </Badge>
                      )}
                      {mutual && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 h-8 w-full text-xs"
                          onClick={() => setChatLike({ ...like, fromUser: like.dress.owner })}
                        >
                          <MessageCircle className="mr-1 h-3 w-3" /> Message
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {liveChatLike && (
        <ChatDialog
          like={liveChatLike}
          open={!!chatLike}
          onOpenChange={(open) => !open && setChatLike(null)}
        />
      )}
      {liveLabelLike && liveLabelLike.myLabel && (
        <ShippingLabelDialog
          like={liveLabelLike}
          open={!!labelLike}
          onOpenChange={(open) => {
            if (!open) {
              sessionStorage.setItem(`shipping-terms-read:${liveLabelLike.id}`, "true")
              setLabelLike(null)
            }
          }}
        />
      )}
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
        <Repeat2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
