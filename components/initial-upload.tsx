"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowRight, Camera, Plus, X, Package, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhotoUploader } from "@/components/photo-uploader"
import { Logo } from "@/components/logo"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useApp } from "@/lib/app-context"
import type {
  DressSize,
  DressCode,
  DressCondition,
  PackageSize,
} from "@/lib/types"
import { imgSrc, isDynamicImage } from "@/lib/images"
import {
  DRESS_SIZES,
  DRESS_CODES,
  DRESS_CONDITIONS,
  DRESS_COLORS,
  PACKAGE_SIZES,
} from "@/lib/constants"
import { cn } from "@/lib/utils"

const MIN_UPLOADS = 1

interface DressEntry {
  id: string
  images: string[]
  brand: string
  details: string
  size: string
  dressCode: string
  condition: string
  color: string
  packageSize: string
  complete: boolean
}

function emptyDress(): DressEntry {
  return {
    id: crypto.randomUUID(),
    images: [],
    brand: "",
    details: "",
    size: "",
    dressCode: "",
    condition: "",
    color: "",
    packageSize: "",
    complete: false,
  }
}

function isDressValid(d: DressEntry): boolean {
  return !!(
    d.images.length >= 3 &&
    d.brand &&
    d.details &&
    d.size &&
    d.dressCode &&
    d.condition &&
    d.color &&
    d.packageSize
  )
}

function ListingPreview({
  dress,
  onEdit,
  onRemove,
  canRemove,
}: {
  dress: DressEntry
  onEdit: () => void
  onRemove: () => void
  canRemove: boolean
}) {
  const pkg = PACKAGE_SIZES.find((p) => p.value === dress.packageSize)
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="relative flex h-24 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
        {dress.images.length > 0 ? (
          <Image
            src={imgSrc(dress.images[0])}
            alt={dress.details || "Dress photo"}
            fill
            className="object-cover"
            sizes="80px"
            unoptimized={isDynamicImage(dress.images[0])}
          />
        ) : (
          <Camera className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-serif text-base font-semibold leading-tight text-foreground">
              {dress.details}
            </h3>
            <p className="text-xs text-muted-foreground">{dress.brand}</p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={onEdit}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Edit listing"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            {canRemove && (
              <button
                onClick={onRemove}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-destructive"
                aria-label="Remove listing"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
            {dress.size}
          </span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
            {dress.color}
          </span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
            {dress.condition}
          </span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
            {dress.dressCode}
          </span>
        </div>
        {pkg && (
          <span className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
            <Package className="h-3 w-3" />
            {pkg.label} parcel · {pkg.weight}
          </span>
        )}
      </div>
    </div>
  )
}

export function InitialUpload() {
  const { updatePreferences, addMyDress, user } = useApp()
  const [dresses, setDresses] = useState<DressEntry[]>([emptyDress()])
  const [activeIndex, setActiveIndex] = useState(0)
  const [saving, setSaving] = useState(false)

  const completedCount = dresses.filter((d) => d.complete).length
  const completedDresses = dresses.filter((d) => d.complete)
  const canFinish = completedCount >= MIN_UPLOADS

  const updateField = (field: keyof DressEntry, value: string) => {
    setDresses((prev) =>
      prev.map((d, i) => (i === activeIndex ? { ...d, [field]: value } : d))
    )
  }

  const setActiveImages = (images: string[]) => {
    setDresses((prev) =>
      prev.map((d, i) => (i === activeIndex ? { ...d, images } : d))
    )
  }

  const markComplete = () => {
    setDresses((prev) =>
      prev.map((d, i) => (i === activeIndex ? { ...d, complete: true } : d))
    )
    if (completedCount + 1 < MIN_UPLOADS) {
      const next = emptyDress()
      setDresses((prev) => [...prev, next])
      setActiveIndex(dresses.length)
    }
  }

  const addAnother = () => {
    const next = emptyDress()
    setDresses((prev) => [...prev, next])
    setActiveIndex(dresses.length)
  }

  const editDress = (id: string) => {
    const idx = dresses.findIndex((d) => d.id === id)
    if (idx === -1) return
    setDresses((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, complete: false } : d))
    )
    setActiveIndex(idx)
  }

  const removeDress = (id: string) => {
    setDresses((prev) => prev.filter((d) => d.id !== id))
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0))
  }

  const handleFinish = async () => {
    if (saving) return
    setSaving(true)
    try {
      // Persist every completed listing to the member's wardrobe.
      for (const d of dresses.filter((x) => x.complete)) {
        await addMyDress({
          id: d.id,
          owner: user,
          images: d.images,
          brand: d.brand,
          name: d.details,
          size: d.size as DressSize,
          dressCode: d.dressCode as DressCode,
          condition: d.condition as DressCondition,
          color: d.color,
          packageSize: d.packageSize as PackageSize,
          createdAt: new Date().toISOString().split("T")[0],
        })
      }
      await updatePreferences({ initialUploadsComplete: true })
    } catch (err) {
      console.error("[v0] Failed to save initial listings:", err)
      setSaving(false)
    }
  }

  const activeDress = dresses[activeIndex]
  const showForm = activeDress && !activeDress.complete
  const activeValid = activeDress ? isDressValid(activeDress) : false

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Progress header */}
      <div className="h-1 w-full bg-secondary">
        <div
          className="h-full bg-foreground transition-all duration-500 ease-out"
          style={{
            width: `${Math.min((completedCount / MIN_UPLOADS) * 100, 100)}%`,
          }}
        />
      </div>

      {/* Brand bar */}
      <div className="flex items-center justify-center px-4 py-3">
        <Logo size={24} />
      </div>

      <div className="flex flex-col items-center px-6 pt-4">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
          <Camera className="h-7 w-7 text-foreground" />
        </div>
        <h1 className="text-center font-serif text-2xl font-semibold text-foreground">
          List your dresses
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {completedCount < MIN_UPLOADS
            ? `Add at least ${MIN_UPLOADS} dress to start swapping.`
            : `${completedCount} ${completedCount === 1 ? "dress" : "dresses"} listed. Add more or start browsing.`}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pt-5 pb-4">
        {/* Completed listing previews */}
        {completedDresses.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Your listings
            </p>
            {completedDresses.map((d) => (
              <ListingPreview
                key={d.id}
                dress={d}
                onEdit={() => editDress(d.id)}
                onRemove={() => removeDress(d.id)}
                canRemove={dresses.length > 1}
              />
            ))}
            {!showForm && (
              <button
                onClick={addAnother}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
                Add another dress
              </button>
            )}
          </div>
        )}

        {/* Active dress form */}
        {showForm && (
          <div className="flex flex-col gap-4">
            {/* Photo upload — camera or gallery */}
            <PhotoUploader
              images={activeDress.images}
              onChange={setActiveImages}
              min={3}
              max={4}
            />

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="brand" className="text-sm font-medium text-foreground">
                Brand
              </Label>
              <Input
                id="brand"
                placeholder="e.g. Reformation, BHLDN"
                value={activeDress.brand}
                onChange={(e) => updateField("brand", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="details" className="text-sm font-medium text-foreground">
                Dress Details
              </Label>
              <Input
                id="details"
                placeholder="e.g. Sage Midi Dress"
                value={activeDress.details}
                onChange={(e) => updateField("details", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-foreground">Size</Label>
                <Select
                  value={activeDress.size}
                  onValueChange={(v) => updateField("size", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {DRESS_SIZES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-foreground">Condition</Label>
                <Select
                  value={activeDress.condition}
                  onValueChange={(v) => updateField("condition", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {DRESS_CONDITIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-foreground">Dress Code</Label>
                <Select
                  value={activeDress.dressCode}
                  onValueChange={(v) => updateField("dressCode", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {DRESS_CODES.map((code) => (
                      <SelectItem key={code} value={code}>
                        {code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-foreground">Color</Label>
                <Select
                  value={activeDress.color}
                  onValueChange={(v) => updateField("color", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {DRESS_COLORS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-foreground">
                Parcel size
              </Label>
              <p className="text-xs text-muted-foreground">
                Used to generate your prepaid shipping label when a swap is
                confirmed.
              </p>
              <Select
                value={activeDress.packageSize}
                onValueChange={(v) => updateField("packageSize", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parcel size" />
                </SelectTrigger>
                <SelectContent>
                  {PACKAGE_SIZES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label} · {p.weight}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="flex flex-col gap-3 px-6 pt-4 pb-10">
        {showForm && (
          <Button
            className="h-12 w-full text-base font-semibold"
            disabled={!activeValid}
            onClick={markComplete}
          >
            Save Listing
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}

        {canFinish && (
          <Button
            variant={showForm ? "outline" : "default"}
            className="h-12 w-full text-base font-semibold"
            onClick={handleFinish}
            disabled={saving}
          >
            {saving ? "Saving your listings…" : "Start Swiping"}
            {!saving && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  )
}
