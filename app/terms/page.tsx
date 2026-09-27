import Link from "next/link"

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-6 py-12 text-foreground">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to Rewear</Link>
      <h1 className="mt-8 font-serif text-4xl">Community Exchange Terms</h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated September 2026</p>
      <div className="mt-8 space-y-6 leading-7 text-muted-foreground">
        <section><h2 className="font-semibold text-foreground">Eligibility</h2><p>Rewear is intended for adults 18 and older. You must provide accurate information and keep your account secure.</p></section>
        <section><h2 className="font-semibold text-foreground">Member listings</h2><p>You may list only dresses you own or are authorized to exchange. Listings must be accurately described, clean, wearable, and represented by current photos. Do not upload prohibited, infringing, or unsafe content.</p></section>
        <section><h2 className="font-semibold text-foreground">Swaps</h2><p>Rewear facilitates introductions between members; members are responsible for agreeing to exchange terms, packaging items carefully, tracking shipments, and communicating honestly. Do not send cash, credentials, or unrelated personal information through the service.</p></section>
        <section><h2 className="font-semibold text-foreground">Safety and moderation</h2><p>We may remove listings, suspend accounts, or cancel exchanges when content or behavior appears fraudulent, unsafe, abusive, or inconsistent with these terms. Report concerns before sending an item.</p></section>
        <section><h2 className="font-semibold text-foreground">Contact</h2><p>Questions, reports, and account concerns should be sent through the support channel provided with your launch invitation.</p></section>
      </div>
    </main>
  )
}
