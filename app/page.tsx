"use client"

import { useState } from "react"
import { AppProvider, useApp } from "@/lib/app-context"
import { BottomNav } from "@/components/bottom-nav"
import { Onboarding } from "@/components/onboarding"
import { InitialUpload } from "@/components/initial-upload"
import { SwipeFeed } from "@/components/swipe-feed"
import { WardrobeView } from "@/components/wardrobe-view"
import { RequestsView } from "@/components/requests-view"
import { UploadView } from "@/components/upload-view"
import { FeedbackView } from "@/components/feedback-view"
import { ProfileView } from "@/components/profile-view"
import { PageHeader } from "@/components/page-header"
import { InviteDialog } from "@/components/invite-dialog"
import { Logo } from "@/components/logo"

type Tab =
  | "home"
  | "wardrobe"
  | "requests"
  | "upload"
  | "feedback"
  | "profile"

const tabConfig: Record<Tab, { title: string; subtitle?: string }> = {
  home: { title: "Discover" },
  wardrobe: { title: "Your Wardrobe", subtitle: "Dresses you offer" },
  requests: { title: "Requests", subtitle: "Manage your swaps" },
  upload: { title: "List a Dress", subtitle: "Share your closet" },
  feedback: { title: "Feedback", subtitle: "Shape the community" },
  profile: { title: "Profile" },
}

function AppContent() {
  const { preferences, loading } = useApp()
  const [activeTab, setActiveTab] = useState<Tab>("home")

  if (loading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background">
        <Logo size={48} />
        <p className="text-sm text-muted-foreground">Loading your closet…</p>
      </div>
    )
  }

  if (!preferences.onboardingComplete) {
    return <Onboarding />
  }

  if (!preferences.initialUploadsComplete) {
    return <InitialUpload />
  }

  const config = tabConfig[activeTab]

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      {/* Safe area top */}
      <div
        className="flex-shrink-0"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      />

      {/* Brand bar */}
      <div className="flex items-center justify-center border-b border-border/60 px-4 py-2">
        <Logo size={48} />
      </div>

      {/* Header */}
      {activeTab !== "profile" && (
        <PageHeader title={config.title} subtitle={config.subtitle} />
      )}

      {/* Content */}
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden" role="tabpanel">
        {activeTab === "home" && <SwipeFeed />}
        {activeTab === "wardrobe" && <WardrobeView />}
        {activeTab === "requests" && <RequestsView />}
        {activeTab === "upload" && <UploadView />}
        {activeTab === "feedback" && <FeedbackView />}
        {activeTab === "profile" && <ProfileView />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <InviteDialog />
    </div>
  )
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
