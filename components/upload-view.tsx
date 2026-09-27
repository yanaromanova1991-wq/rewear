"use client"

import { useState } from "react"
import Image from "next/image"
import { Camera, Package, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PhotoUploader } from "@/components/photo-uploader"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DRESS_SIZES,
  DRESS_CODES,
  DRESS_CONDITIONS,
  DRESS_COLORS,
  PACKAGE_SIZES,
} from "@/lib/constants"
import { useApp } from "@/lib/app-context"
import { imgSrc, isDynamicImage } from "@/lib/images"
import type {
  Dress,
  DressSize,
  DressCode,
  DressCondition,
  PackageSize,
} from "@/lib/types"

const emptyForm = {
  brand: "",
  details: "",
  size: "",
  dressCode: "",
  condition: "",
  color: "",
  packageSize: "",
  notes: "",
}

export function UploadView() {
  const { addMyDress, user } = useApp()
  const [submitted, setSubmitted] = useState<typeof emptyForm | null>(null)
  const [submittedImages, setSubmittedImages] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState(emptyForm)

  const isValid =
    images.length >= 3 &&
    formData.brand &&
    formData.details &&
    formData.size &&
    formData.dressCode &&
    formData.condition &&
    formData.color &&
    formData.packageSize

  const handleSubmit = async () => {
    if (!isValid || saving) return
    setSaving(true)
    const finalImages = images
    const newDress: Dress = {
      id: `my-dress-${Date.now()}`,
      owner: user,
      images: finalImages,
      brand: formData.brand,
      name: formData.details,
      size: formData.size as DressSize,
      dressCode: formData.dressCode as DressCode,
      condition: formData.condition as DressCondition,
      color: formData.color,
      packageSize: formData.packageSize as PackageSize,
      notes: formData.notes || undefined,
      createdAt: new Date().toISOString().split("T")[0],
    }
    try {
      await addMyDress(newDress)
      setSubmittedImages(finalImages)
      setSubmitted(formData)
    } catch (err) {
      console.error("[v0] Failed to submit listing:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleListAnother = () => {
    setSubmitted(null)
    setSubmittedImages([])
    setImages([])
    setFormData(emptyForm)
  }

  // Preview of the submitted listing
  if (submitted) {
    const pkg = PACKAGE_SIZES.find((p) => p.value === submitted.packageSize)
    return (
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-28 pt-4">
        <div className="rounded-xl bg-success/10 px-4 py-3 text-center">
          <p className="text-sm font-medium text-success">
            Listing submitted — here is your preview
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Your listing is available in Discover now. There is no manual review queue at this stage.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {submittedImages.length > 0 ? (
            <div className="relative h-56 w-full bg-secondary">
              <Image
                src={imgSrc(submittedImages[0])}
                alt={submitted.details || "Dress photo"}
                fill
                className="object-cover"
                sizes="100vw"
                unoptimized={isDynamicImage(submittedImages[0])}
              />
              {submittedImages.length > 1 && (
                <span className="absolute bottom-2 right-2 rounded-full bg-background/80 px-2 py-0.5 text-xs font-medium text-foreground">
                  +{submittedImages.length - 1}
                </span>
              )}
            </div>
          ) : (
            <div className="flex h-56 items-center justify-center bg-secondary">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Camera className="h-8 w-8" />
                <span className="text-xs">Your photos appear here</span>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2 p-4">
            <div>
              <h3 className="font-serif text-lg font-semibold leading-tight text-foreground">
                {submitted.details}
              </h3>
              <p className="text-sm text-muted-foreground">{submitted.brand}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                {submitted.size}
              </span>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                {submitted.color}
              </span>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                {submitted.condition}
              </span>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                {submitted.dressCode}
              </span>
            </div>
            {pkg && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Package className="h-3.5 w-3.5" />
                {pkg.label} parcel · {pkg.weight} — prepaid label ready on swap
              </span>
            )}
            {submitted.notes && (
              <p className="mt-1 text-sm text-muted-foreground">
                {submitted.notes}
              </p>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          className="h-12 w-full text-base font-semibold"
          onClick={handleListAnother}
        >
          <Plus className="mr-2 h-4 w-4" />
          List another dress
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-28 pt-1">
      {/* Photo upload — camera or gallery */}
      <PhotoUploader images={images} onChange={setImages} min={3} max={4} />

      {/* Form fields */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="brand" className="text-sm font-medium text-foreground">
            Brand
          </Label>
          <Input
            id="brand"
            placeholder="e.g. Reformation, BHLDN"
            value={formData.brand}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, brand: e.target.value }))
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="details" className="text-sm font-medium text-foreground">
            Dress Details
          </Label>
          <Input
            id="details"
            placeholder="e.g. Sage Midi Dress"
            value={formData.details}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, details: e.target.value }))
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-foreground">Size</Label>
            <Select
              value={formData.size}
              onValueChange={(v) =>
                setFormData((prev) => ({ ...prev, size: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {DRESS_SIZES.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-foreground">Condition</Label>
            <Select
              value={formData.condition}
              onValueChange={(v) =>
                setFormData((prev) => ({ ...prev, condition: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {DRESS_CONDITIONS.map((cond) => (
                  <SelectItem key={cond} value={cond}>
                    {cond}
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
              value={formData.dressCode}
              onValueChange={(v) =>
                setFormData((prev) => ({ ...prev, dressCode: v }))
              }
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
              value={formData.color}
              onValueChange={(v) =>
                setFormData((prev) => ({ ...prev, color: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {DRESS_COLORS.map((color) => (
                  <SelectItem key={color} value={color}>
                    {color}
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
            value={formData.packageSize}
            onValueChange={(v) =>
              setFormData((prev) => ({ ...prev, packageSize: v }))
            }
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

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes" className="text-sm font-medium text-foreground">
            Notes
          </Label>
          <Textarea
            id="notes"
            placeholder="Any details about fit, alterations, or styling..."
            rows={3}
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
          />
        </div>
      </div>

      <Button
        className="h-12 w-full text-base font-semibold"
        disabled={!isValid || saving}
        onClick={handleSubmit}
      >
        {saving ? "Submitting…" : "Submit Listing"}
      </Button>
    </div>
  )
}
