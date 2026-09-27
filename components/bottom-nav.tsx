"use client"

import { Heart, Repeat2, Plus, User, Sparkles, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

type Tab =
  | "home"
  | "wardrobe"
  | "requests"
  | "upload"
  | "feedback"
  | "profile"

const tabs: { id: Tab; label: string; icon: typeof Heart }[] = [
  { id: "home", label: "Discover", icon: Sparkles },
  { id: "wardrobe", label: "Wardrobe", icon: Heart },
  { id: "requests", label: "Requests", icon: Repeat2 },
  { id: "upload", label: "Upload", icon: Plus },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
  { id: "profile", label: "Profile", icon: User },
]

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-1 py-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/70"
              )}
            >
              <Icon
                className={cn(
                  "transition-all",
                  isActive ? "h-5 w-5 stroke-[2.5]" : "h-5 w-5 stroke-[1.5]"
                )}
              />
              <span
                className={cn(
                  "text-[10px] leading-tight",
                  isActive ? "font-semibold" : "font-medium"
                )}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
