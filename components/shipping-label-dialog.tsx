"use client"

import { Package, MapPin, MessageCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PACKAGE_SIZES } from "@/lib/constants"
import type { IncomingLike } from "@/lib/types"

interface ShippingLabelDialogProps {
  like: IncomingLike
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShippingLabelDialog({
  like,
  open,
  onOpenChange,
}: ShippingLabelDialogProps) {
  const label = like.myLabel
  if (!label) return null

  const pkg = PACKAGE_SIZES.find((p) => p.value === label.packageSize)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4">
        <DialogHeader>
          <DialogTitle className="font-serif">Arrange shipping</DialogTitle>
          <DialogDescription>
            Shipping is arranged and paid for directly by members at this stage.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 bg-secondary px-4 py-3 text-foreground">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-semibold">Arrange it in chat</span>
          </div>
          <div className="flex flex-col gap-2 px-4 py-4 text-sm">
            <p className="text-foreground">
              Message {like.fromUser.name} to agree on the carrier, address exchange, and who pays postage.
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Keep addresses and tracking details inside this chat. Add tracking after you ship so both members can follow the exchange.
            </p>
          </div>
          <div className="flex flex-col gap-2 border-t border-border px-4 py-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4 flex-shrink-0" />
              <span>
                {pkg ? `${pkg.label} parcel · ${pkg.weight}` : label.packageSize}
              </span>
            </div>
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>
                Ship to {like.fromUser.name} — {like.fromUser.location}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Item: {like.dress.brand} {like.dress.name}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button className="w-full" onClick={() => onOpenChange(false)}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
