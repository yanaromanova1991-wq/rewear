"use client"

import { useState } from "react"
import {
  MapPin,
  Star,
  Settings,
  ChevronRight,
  HelpCircle,
  Bell,
  Shield,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useApp } from "@/lib/app-context"

const menuItems = [
  { icon: Bell, label: "Notifications" },
  { icon: Shield, label: "Privacy" },
  { icon: HelpCircle, label: "Help & Support" },
  { icon: Settings, label: "Settings" },
]

export function ProfileView() {
  const { user, myDresses, preferences, completedExchanges, signOut } =
    useApp()
  const [notice, setNotice] = useState<string | null>(null)

  const displayName = preferences.userName || user.name
  const displayLocation = preferences.eventLocation || user.location

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-28 pt-2">
      {/* Profile header */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <Avatar className="h-20 w-20 border-2 border-border">
          <AvatarFallback className="bg-secondary text-lg font-semibold text-foreground">
            {displayName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            {displayName}
          </h2>
          <div className="mt-1 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{displayLocation}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-accent text-accent" />
          <span className="text-sm font-medium text-foreground">
            {user.rating}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Listed", value: myDresses.length },
          { label: "Swaps", value: user.completedSwaps + completedExchanges },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center gap-0.5 rounded-xl bg-card p-3 shadow-sm"
          >
            <span className="text-xl font-bold text-foreground">
              {stat.value}
            </span>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      <Button variant="outline" className="h-11 w-full font-medium" onClick={() => setNotice("Profile editing is coming next. Your onboarding details are already saved.")}>
        Edit Profile
      </Button>
      {notice && (
        <button className="rounded-lg bg-secondary px-3 py-2 text-left text-xs text-muted-foreground" onClick={() => setNotice(null)}>
          {notice}
        </button>
      )}

      <Separator />

      {/* Menu items */}
      <div className="flex flex-col gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              onClick={() => setNotice(`${item.label} settings are ready to be configured.`)}
              className="flex min-h-[48px] items-center gap-3 rounded-lg px-2 py-2.5 text-foreground transition-colors hover:bg-secondary"
            >
              <Icon className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-left text-sm font-medium">
                {item.label}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          )
        })}
      </div>

      <Separator />

      <button
        onClick={() => void signOut()}
        className="flex min-h-[48px] items-center gap-3 rounded-lg px-2 py-2.5 text-destructive transition-colors hover:bg-destructive/5"
      >
        <LogOut className="h-5 w-5" />
        <span className="text-sm font-medium">Log Out</span>
      </button>
    </div>
  )
}
