import Link from "next/link"

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-6 py-12 text-foreground">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to Rewear</Link>
      <h1 className="mt-8 font-serif text-4xl">Privacy Policy</h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated September 2026</p>
      <div className="mt-8 space-y-6 leading-7 text-muted-foreground">
        <section><h2 className="font-semibold text-foreground">What we collect</h2><p>We collect account details, profile preferences, dress listings, photos, and information needed to operate swaps. We also receive basic device and usage information needed to keep the service secure.</p></section>
        <section><h2 className="font-semibold text-foreground">How we use it</h2><p>We use this information to authenticate members, show listings, facilitate matches and exchanges, provide support, and prevent abuse. We do not sell personal information.</p></section>
        <section><h2 className="font-semibold text-foreground">Photos and visibility</h2><p>Dress photos are stored privately and displayed only through authenticated application routes. Other members may see approved listing details and photos when browsing the exchange.</p></section>
        <section><h2 className="font-semibold text-foreground">Your choices</h2><p>You may request access, correction, or deletion of your account information by contacting the Rewear team. Deleting an account may remove associated listings and exchange history.</p></section>
        <section><h2 className="font-semibold text-foreground">Contact</h2><p>For privacy questions or safety concerns, contact the Rewear team through the support channel provided with your launch invitation.</p></section>
      </div>
    </main>
  )
}
