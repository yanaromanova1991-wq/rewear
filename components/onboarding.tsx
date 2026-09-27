"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, UserRound, Ruler, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/lib/app-context"
import { Logo } from "@/components/logo"
import { DRESS_SIZES, DRESS_CODES, EUROPEAN_CITIES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { DressSize, DressCode } from "@/lib/types"


const steps = [
  {
    title: "Welcome! Tell us about you",
    subtitle: "Your name and city help us connect you with nearby swappers.",
    icon: UserRound,
  },
  {
    title: "What's your size?",
    subtitle: "Select all sizes that fit you.",
    icon: Ruler,
  },
  {
    title: "What's the dress code?",
    subtitle: "Select all that apply.",
    icon: Sparkles,
  },
]

function calcAge(dob: string): number | undefined {
  if (!dob) return undefined
  const birth = new Date(dob)
  if (Number.isNaN(birth.getTime())) return undefined
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age
}

export function Onboarding() {
  const { updatePreferences, preferences } = useApp()
  const [step, setStep] = useState(0)
  const [firstName, setFirstName] = useState(preferences.firstName ?? "")
  const [lastName, setLastName] = useState(preferences.lastName ?? "")
  const [dob, setDob] = useState(preferences.dateOfBirth ?? "")
  const [location, setLocation] = useState(preferences.eventLocation ?? "")
  const [cityQuery, setCityQuery] = useState(preferences.eventLocation ?? "")
  const [cityOpen, setCityOpen] = useState(false)
  const [sizes, setSizes] = useState<DressSize[]>(preferences.sizes ?? [])
  const [dressCodes, setDressCodes] = useState<DressCode[]>(
    preferences.dressCodes ?? []
  )
  const [saving, setSaving] = useState(false)

  const age = calcAge(dob)
  const filteredCities = EUROPEAN_CITIES.filter((c) =>
    c.toLowerCase().includes(cityQuery.trim().toLowerCase())
  ).slice(0, 8)

  const canContinue = () => {
    if (step === 0)
      return (
        firstName.trim().length > 0 &&
        lastName.trim().length > 0 &&
        location.trim().length > 0 &&
        age !== undefined &&
        age >= 18 &&
        age <= 120
      )
    if (step === 1) return sizes.length > 0
    if (step === 2) return dressCodes.length > 0
    return true
  }

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
      return
    }
    if (saving) return
    setSaving(true)
    try {
      await updatePreferences({
        userName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dob || undefined,
        age,
        eventLocation: location,
        sizes,
        dressCodes,
        onboardingComplete: true,
      })
    } catch (err) {
      console.error("[v0] Failed to save profile:", err)
      setSaving(false)
    }
  }

  const toggleSize = (s: DressSize) => {
    setSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const toggleDressCode = (code: DressCode) => {
    setDressCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  const currentStep = steps[step]
  const Icon = currentStep.icon
  const progress = ((step + 1) / steps.length) * 100

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Progress bar */}
      <div className="h-1 w-full bg-secondary">
        <div
          className="h-full bg-foreground transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Brand + back button row */}
      <div className="relative flex h-14 items-center px-4">
        {step > 0 && (
          <button
            onClick={handleBack}
            className="z-10 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}
        {step > 0 && (
          <div className="pointer-events-none absolute inset-x-0 flex justify-center">
            <Logo size={26} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6">
        {/* Logo on welcome step, icon on the rest */}
        {step === 0 ? (
          <div className="mb-6 flex items-center justify-center">
            <Logo size={84} />
          </div>
        ) : (
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
            <Icon className="h-7 w-7 text-foreground" />
          </div>
        )}

        {/* Title */}
        <h1 className="text-center font-serif text-2xl font-semibold text-foreground">
          {currentStep.title}
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {currentStep.subtitle}
        </p>

        {/* Step content */}
        <div className="mt-8 w-full max-w-sm">
          {step === 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First name
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Maya"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last name
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Patel"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>
              </div>

              {/* Searchable city */}
              <div className="relative flex flex-col gap-1.5">
                <Label htmlFor="city" className="text-sm font-medium">
                  City
                </Label>
                <Input
                  id="city"
                  placeholder="Start typing your city…"
                  value={cityQuery}
                  autoComplete="off"
                  onChange={(e) => {
                    setCityQuery(e.target.value)
                    setLocation("")
                    setCityOpen(true)
                  }}
                  onFocus={() => setCityOpen(true)}
                  onBlur={() => setTimeout(() => setCityOpen(false), 150)}
                  className="h-12 text-base"
                />
                {cityOpen && cityQuery.trim().length > 0 && (
                  <ul className="absolute top-full z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-popover py-1 shadow-md">
                    {filteredCities.length > 0 ? (
                      filteredCities.map((city) => (
                        <li key={city}>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setLocation(city)
                              setCityQuery(city)
                              setCityOpen(false)
                            }}
                            className={cn(
                              "flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-secondary",
                              location === city &&
                                "bg-secondary font-medium text-foreground"
                            )}
                          >
                            {city}
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="px-3 py-2 text-sm text-muted-foreground">
                        We&apos;re not in that city yet.
                      </li>
                    )}
                  </ul>
                )}
              </div>

              {/* Age with calendar */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dob" className="text-sm font-medium">
                  Date of birth
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDob(e.target.value)}
                  className="h-12 text-base"
                />
                <p className="text-xs text-muted-foreground">
                  {age !== undefined && age < 18
                    ? "You must be at least 18 to join."
                    : "Pick your birthday — you must be 18 or older."}
                </p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-wrap justify-center gap-2">
              {DRESS_SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSize(s)}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                    sizes.includes(s)
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-foreground hover:border-foreground/40"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-wrap justify-center gap-2">
              {DRESS_CODES.map((code) => (
                <Badge
                  key={code}
                  variant={dressCodes.includes(code) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-4 py-2 text-sm transition-colors",
                    dressCodes.includes(code)
                      ? "bg-foreground text-background hover:bg-foreground/90"
                      : "bg-card text-foreground hover:bg-secondary"
                  )}
                  onClick={() => toggleDressCode(code)}
                >
                  {code}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex flex-col gap-3 px-6 pb-10 pt-4">
        <Button
          className="h-12 w-full text-base font-semibold"
          disabled={!canContinue() || saving}
          onClick={handleNext}
        >
          {step < steps.length - 1 ? (
            <>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : saving ? (
            "Setting up your closet…"
          ) : (
            "Start Swiping"
          )}
        </Button>
      </div>
    </div>
  )
}
