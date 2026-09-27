"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { QRCodeSVG } from "qrcode.react"
import {
  Heart,
  ShieldCheck,
  Check,
  MapPin,
  CalendarClock,
  Truck,
  PartyPopper,
  ArrowRight,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useApp } from "@/lib/app-context"
import type { Dress, IncomingLike } from "@/lib/types"

interface ExchangeDialogProps {
  like: IncomingLike
  theirDress?: Dress
  open: boolean
  onOpenChange: (open: boolean) => void
}

function daysLeft(shipByDate?: string) {
  if (!shipByDate) return 0
  const diff = new Date(shipByDate).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86400000))
}

function formatDate(iso?: string) {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export function ExchangeDialog({
  like,
  theirDress,
  open,
  onOpenChange,
}: ExchangeDialogProps) {
  const { user, confirmExchange, uploadMyTracking, shipWindowDays } = useApp()
  const [understood, setUnderstood] = useState(false)
  const [trackingInput, setTrackingInput] = useState("")
  const [showLabel, setShowLabel] = useState(false)

  const exchange = like.exchange
  const stage: "confirm" | "ship" | "done" = !exchange?.iConfirmed
    ? "confirm"
    : !exchange.myTracking
      ? "ship"
      : "done"

  const partner = like.fromUser
  const myDress = like.dress

  const labelTracking = useMemo(
    () => `RW-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    [],
  )

  const handleConfirm = () => {
    confirmExchange(like.id)
    setUnderstood(false)
  }

  const handleSaveTracking = (tracking: string) => {
    uploadMyTracking(like.id, tracking)
    setTrackingInput("")
    setShowLabel(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] gap-4 overflow-y-auto">
        {/* ---------- STAGE: CONFIRM ---------- */}
        {stage === "confirm" && (
          <>
            <DialogHeader>
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
                  <Heart className="h-4 w-4 text-accent-foreground" />
                </span>
                <DialogTitle className="font-serif">
                  You matched with {partner.name}!
                </DialogTitle>
              </div>
              <DialogDescription>
                You both loved each other&apos;s dresses. Here&apos;s how the
                swap works — it only takes a few days.
              </DialogDescription>
            </DialogHeader>

            {/* Dress pair */}
            <div className="flex items-center justify-center gap-3">
              <SwapThumb
                image={myDress.images[0]}
                caption="You send"
                name={myDress.name}
              />
              <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <SwapThumb
                image={theirDress?.images[0]}
                caption="You get"
                name={theirDress?.name ?? "Their dress"}
              />
            </div>

            {/* Steps */}
            <ol className="flex flex-col gap-2 rounded-xl bg-secondary/60 p-3 text-sm">
              {[
                "You both confirm the swap",
                "We show you each other's shipping address",
                `Post your dress within ${shipWindowDays} days`,
                "Add your tracking so you can both follow along",
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{text}</span>
                </li>
              ))}
            </ol>

            {/* Friendly community promise / warning */}
            <div className="flex gap-2 rounded-xl border border-border bg-card p-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-foreground" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                This is a little promise to a fellow member. Once you confirm,
                please post your dress within {shipWindowDays} days. If life gets
                in the way and you don&apos;t send, we&apos;ll gently remind
                you — but after <strong className="text-foreground">2 missed
                sends</strong> we&apos;ll have to remove you from the community
                to keep things fair for everyone. We know you&apos;ve got this!
              </p>
            </div>

            {/* Understand toggle */}
            <button
              type="button"
              onClick={() => setUnderstood((v) => !v)}
              className="flex items-center gap-2.5 rounded-xl px-1 py-1 text-left"
              aria-pressed={understood}
            >
              <span
                className={
                  "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-colors " +
                  (understood
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card")
                }
              >
                {understood && <Check className="h-3 w-3" />}
              </span>
              <span className="text-sm text-foreground">
                I understand — I&apos;ll post my dress within {shipWindowDays}{" "}
                days.
              </span>
            </button>

            <Button
              className="w-full"
              disabled={!understood}
              onClick={handleConfirm}
            >
              Confirm the swap
            </Button>
          </>
        )}

        {/* ---------- STAGE: SHIP ---------- */}
        {stage === "ship" && exchange && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif">
                It&apos;s on — time to post!
              </DialogTitle>
              <DialogDescription>
                You both confirmed. Pop your dress in the mail and add your
                tracking below.
              </DialogDescription>
            </DialogHeader>

            {/* Deadline */}
            <div className="flex items-center gap-2 rounded-xl bg-accent/40 px-3 py-2.5">
              <CalendarClock className="h-4 w-4 flex-shrink-0 text-accent-foreground" />
              <p className="text-sm text-accent-foreground">
                Please ship by{" "}
                <strong>{formatDate(exchange.shipByDate)}</strong> —{" "}
                {daysLeft(exchange.shipByDate)} day
                {daysLeft(exchange.shipByDate) === 1 ? "" : "s"} left.
              </p>
            </div>

            {/* Addresses */}
            <AddressCard
              heading={`Send your ${myDress.name} to`}
              name={partner.name}
              address={partner.address ?? partner.location}
            />
            <AddressCard
              heading={`${partner.name} is sending ${theirDress?.name ?? "their dress"} to`}
              name={user.name === "You" ? "You" : user.name}
              address={user.address ?? user.location}
            />

            {/* Partner shipment status */}
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
              <Truck className="h-4 w-4 flex-shrink-0 text-success" />
              <p className="text-xs text-muted-foreground">
                {partner.name} has shipped —{" "}
                <span className="font-mono text-foreground">
                  {exchange.theirTracking}
                </span>
              </p>
            </div>

            {/* Your shipment */}
            {!showLabel ? (
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="tracking"
                  className="text-sm font-medium text-foreground"
                >
                  Add your tracking number
                </label>
                <div className="flex gap-2">
                  <Input
                    id="tracking"
                    placeholder="e.g. 9400 1000 0000 0000"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                  />
                  <Button
                    disabled={!trackingInput.trim()}
                    onClick={() => handleSaveTracking(trackingInput)}
                  >
                    Save
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLabel(true)}
                  className="text-left text-xs font-medium text-foreground underline underline-offset-2"
                >
                  Don&apos;t have a label? Get a free prepaid one
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-medium text-foreground">
                  Your prepaid label
                </p>
                <div className="rounded-lg bg-card p-2 ring-1 ring-border">
                  <QRCodeSVG value={labelTracking} size={128} level="M" />
                </div>
                <p className="font-mono text-sm font-semibold tracking-wider text-foreground">
                  {labelTracking}
                </p>
                <p className="text-center text-xs text-muted-foreground">
                  Show this at any pickup point — postage is covered. We&apos;ll
                  use this as your tracking.
                </p>
                <Button
                  className="w-full"
                  onClick={() => handleSaveTracking(labelTracking)}
                >
                  I&apos;ve shipped it
                </Button>
              </div>
            )}
          </>
        )}

        {/* ---------- STAGE: DONE ---------- */}
        {stage === "done" && exchange && (
          <>
            <DialogHeader>
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
                  <PartyPopper className="h-4 w-4 text-accent-foreground" />
                </span>
                <DialogTitle className="font-serif">
                  Both dresses are on their way!
                </DialogTitle>
              </div>
              <DialogDescription>
                Thanks for keeping the community thriving. Here are both
                tracking numbers so you can follow along.
              </DialogDescription>
            </DialogHeader>

            <TrackingRow
              label={`Your ${myDress.name} → ${partner.name}`}
              tracking={exchange.myTracking!}
            />
            <TrackingRow
              label={`${theirDress?.name ?? "Their dress"} → You`}
              tracking={exchange.theirTracking!}
            />

            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function SwapThumb({
  image,
  caption,
  name,
}: {
  image?: string
  caption: string
  name: string
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-24 w-20 overflow-hidden rounded-lg bg-secondary">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>
      <span className="text-[11px] font-medium text-muted-foreground">
        {caption}
      </span>
    </div>
  )
}

function AddressCard({
  heading,
  name,
  address,
}: {
  heading: string
  name: string
  address: string
}) {
  return (
    <div className="flex gap-2 rounded-xl border border-border bg-card p-3">
      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{heading}</span>
        <span className="text-sm font-semibold text-foreground">{name}</span>
        <span className="text-sm text-muted-foreground">{address}</span>
      </div>
    </div>
  )
}

function TrackingRow({
  label,
  tracking,
}: {
  label: string
  tracking: string
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-xs font-semibold text-foreground">
        {tracking}
      </span>
    </div>
  )
}
