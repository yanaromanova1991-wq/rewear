"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import type {
  Dress,
  DressSize,
  DressCode,
  DressCondition,
  PackageSize,
} from "@/lib/types"

interface DressEditDialogProps {
  dress: Dress
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DressEditDialog({
  dress,
  open,
  onOpenChange,
}: DressEditDialogProps) {
  const { updateMyDress } = useApp()
  const [images, setImages] = useState<string[]>(dress.images)
  const [brand, setBrand] = useState(dress.brand)
  const [name, setName] = useState(dress.name)
  const [size, setSize] = useState<string>(dress.size)
  const [dressCode, setDressCode] = useState<string>(dress.dressCode)
  const [condition, setCondition] = useState<string>(dress.condition)
  const [color, setColor] = useState<string>(dress.color)
  const [packageSize, setPackageSize] = useState<string>(dress.packageSize)
  const [notes, setNotes] = useState(dress.notes ?? "")
  const [saving, setSaving] = useState(false)

  const photosValid = images.length >= 3

  const handleSave = async () => {
    if (saving || !photosValid) return
    setSaving(true)
    try {
      await updateMyDress({
        ...dress,
        images: images.length > 0 ? images : dress.images,
        brand,
        name,
        size: size as DressSize,
        dressCode: dressCode as DressCode,
        condition: condition as DressCondition,
        color,
        packageSize: packageSize as PackageSize,
        notes,
      })
      onOpenChange(false)
    } catch (err) {
      console.error("[v0] Failed to update listing:", err)
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] gap-4 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Edit listing</DialogTitle>
        </DialogHeader>

        {/* Photos */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">Photos</Label>
          <PhotoUploader
            images={images}
            onChange={setImages}
            min={3}
            max={4}
            showTips={false}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-brand" className="text-sm font-medium">
            Brand
          </Label>
          <Input
            id="edit-brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-name" className="text-sm font-medium">
            Dress details
          </Label>
          <Input
            id="edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Size</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger>
                <SelectValue />
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
            <Label className="text-sm font-medium">Condition</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger>
                <SelectValue />
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
            <Label className="text-sm font-medium">Dress code</Label>
            <Select value={dressCode} onValueChange={setDressCode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DRESS_CODES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Color</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger>
                <SelectValue />
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
          <Label className="text-sm font-medium">Parcel size</Label>
          <Select value={packageSize} onValueChange={setPackageSize}>
            <SelectTrigger>
              <SelectValue />
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
          <Label htmlFor="edit-notes" className="text-sm font-medium">
            Notes
          </Label>
          <Textarea
            id="edit-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !photosValid}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
