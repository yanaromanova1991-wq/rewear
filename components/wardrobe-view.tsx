"use client"

import { useState } from "react"
import Image from "next/image"
import { Shirt, Pencil, Package, Heart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/lib/app-context"
import { imgSrc, isDynamicImage } from "@/lib/images"
import { PACKAGE_SIZES } from "@/lib/constants"
import { DressEditDialog } from "@/components/dress-edit-dialog"
import type { Dress } from "@/lib/types"

export function WardrobeView() {
  const { myDresses, incomingLikes, deleteMyDress } = useApp()
  const [editing, setEditing] = useState<Dress | null>(null)

  const likesForDress = (dressId: string) =>
    incomingLikes.filter(
      (l) => l.dress.id === dressId && l.status !== "declined"
    ).length

  if (myDresses.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
          <Shirt className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-foreground">
            No dresses listed yet
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Head to Upload to list the dresses you want to offer for swaps.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 pb-2 pt-1">
        <p className="text-sm text-muted-foreground">
          {myDresses.length} {myDresses.length === 1 ? "dress" : "dresses"} you
          offer
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 px-4 pb-24">
        {myDresses.map((dress) => {
          const pkg = PACKAGE_SIZES.find((p) => p.value === dress.packageSize)
          const likes = likesForDress(dress.id)
          return (
            <div
              key={dress.id}
              className="group relative flex flex-col overflow-hidden rounded-xl bg-card shadow-sm"
            >
              <div className="relative aspect-[3/4]">
                <Image
                  src={imgSrc(dress.images[0])}
                  alt={`${dress.brand} ${dress.name}`}
                  fill
                  className="object-cover"
                  sizes="50vw"
                  unoptimized={isDynamicImage(dress.images[0])}
                />
                {likes > 0 && (
                  <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-background/85 px-2 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur-sm">
                    <Heart className="h-3 w-3 fill-accent text-accent" />
                    {likes}
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1 p-3">
                <h3 className="truncate text-sm font-semibold text-foreground">
                  {dress.name}
                </h3>
                <p className="text-xs text-muted-foreground">{dress.brand}</p>
                <div className="mt-0.5 flex flex-wrap gap-1">
                  <Badge
                    variant="outline"
                    className="px-1.5 py-0 text-[10px]"
                  >
                    {dress.size}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="px-1.5 py-0 text-[10px]"
                  >
                    {dress.color}
                  </Badge>
                </div>
                {pkg && (
                  <span className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Package className="h-3 w-3" />
                    {pkg.label} · {pkg.weight}
                  </span>
                )}
                <div className="mt-auto grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => setEditing(dress)}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-destructive hover:text-destructive"
                    onClick={async () => {
                      if (!window.confirm(`Delete ${dress.name}? This cannot be undone.`)) return
                      await deleteMyDress(dress.id)
                    }}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {editing && (
        <DressEditDialog
          dress={editing}
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
        />
      )}
    </div>
  )
}
