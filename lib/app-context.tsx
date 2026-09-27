"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react"
import type {
  Dress,
  DressSize,
  DressCode,
  DressCondition,
  IncomingLike,
  OutgoingLike,
  ExchangeState,
  PackageSize,
  User,
  UserPreferences,
  Message,
  ShippingLabel,
} from "./types"
import { createClient } from "@/lib/supabase/client"

const SHIP_WINDOW_DAYS = 4

// ---- DB row shapes ---------------------------------------------------------

interface ProfileRow {
  id: string
  first_name: string | null
  last_name: string | null
  full_name: string | null
  avatar_url: string | null
  location: string | null
  address: string | null
  date_of_birth: string | null
  age: number | null
  sizes: string[] | null
  dress_codes: string[] | null
  rating: number | null
  onboarding_complete: boolean
  initial_uploads_complete: boolean
}

interface DressRow {
  id: string
  owner_id: string
  images: string[] | null
  brand: string
  name: string
  size: string
  dress_code: string
  condition: string
  color: string
  package_size: string
  notes: string | null
  created_at: string
}

// ---- Mappers ---------------------------------------------------------------

function profileToUser(p: ProfileRow, dressesListed: number): User {
  const name =
    p.full_name ||
    [p.first_name, p.last_name].filter(Boolean).join(" ") ||
    "Member"
  return {
    id: p.id,
    name,
    avatar: p.avatar_url || "",
    location: p.location || "",
    address: p.address || undefined,
    rating: p.rating ?? 5,
    dressesListed,
    completedSwaps: 0,
  }
}

function profileToPreferences(p: ProfileRow): UserPreferences {
  return {
    userName: p.full_name || undefined,
    firstName: p.first_name || undefined,
    lastName: p.last_name || undefined,
    dateOfBirth: p.date_of_birth || undefined,
    age: p.age ?? undefined,
    eventLocation: p.location || undefined,
    sizes: (p.sizes as DressSize[]) || [],
    dressCodes: (p.dress_codes as DressCode[]) || [],
    onboardingComplete: p.onboarding_complete,
    initialUploadsComplete: p.initial_uploads_complete,
  }
}

function dressRowToDress(row: DressRow, owner: User): Dress {
  return {
    id: row.id,
    owner,
    images: row.images || [],
    brand: row.brand,
    name: row.name,
    size: row.size as DressSize,
    dressCode: row.dress_code as DressCode,
    condition: row.condition as DressCondition,
    color: row.color,
    packageSize: row.package_size as PackageSize,
    notes: row.notes || undefined,
    createdAt: row.created_at,
  }
}

// Translate app preferences into profile columns.
function preferencesToColumns(
  prefs: Partial<UserPreferences>
): Record<string, unknown> {
  const cols: Record<string, unknown> = {}
  if (prefs.userName !== undefined) cols.full_name = prefs.userName
  if (prefs.firstName !== undefined) cols.first_name = prefs.firstName
  if (prefs.lastName !== undefined) cols.last_name = prefs.lastName
  if (prefs.dateOfBirth !== undefined) cols.date_of_birth = prefs.dateOfBirth
  if (prefs.age !== undefined) cols.age = prefs.age
  if (prefs.eventLocation !== undefined) cols.location = prefs.eventLocation
  if (prefs.sizes !== undefined) cols.sizes = prefs.sizes
  if (prefs.dressCodes !== undefined) cols.dress_codes = prefs.dressCodes
  if (prefs.onboardingComplete !== undefined)
    cols.onboarding_complete = prefs.onboardingComplete
  if (prefs.initialUploadsComplete !== undefined)
    cols.initial_uploads_complete = prefs.initialUploadsComplete
  return cols
}

// ---- Session-only state (feed / matches / chat / exchange demo) ------------

interface SessionState {
  outgoingLikes: OutgoingLike[]
  incomingLikes: IncomingLike[]
  skippedIds: string[]
  completedExchanges: number
}

interface AppContextType {
  loading: boolean
  // persisted
  user: User
  myDresses: Dress[]
  preferences: UserPreferences
  // feed + matches (session/sample)
  dresses: Dress[]
  outgoingLikes: OutgoingLike[]
  incomingLikes: IncomingLike[]
  skippedIds: string[]
  completedExchanges: number
  availableDresses: Dress[]
  // swiping
  likeDress: (dress: Dress) => void
  skipDress: (dressId: string) => void
  removeOutgoingLike: (likeId: string) => void
  // my wardrobe (persisted)
  addMyDress: (dress: Dress) => Promise<void>
  updateMyDress: (dress: Dress) => Promise<void>
  deleteMyDress: (dressId: string) => Promise<boolean>
  // incoming requests + messaging
  acceptIncoming: (likeId: string) => void
  declineIncoming: (likeId: string) => void
  sendMessage: (likeId: string, text: string) => void
  // mutual-match transaction flow
  confirmExchange: (likeId: string) => void
  uploadMyTracking: (likeId: string, tracking: string) => void
  generateLabel: (likeId: string) => void
  shipWindowDays: number
  // helpers
  isMutualWithUser: (userId: string) => boolean
  availableSwaps: number
  canStartSwap: boolean
  // prefs
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>
  signOut: () => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

function makeTrackingNumber() {
  const block = () => Math.random().toString(36).slice(2, 6).toUpperCase()
  return `RW-${block()}-${block()}`
}

const EMPTY_USER: User = {
  id: "",
  name: "Member",
  avatar: "",
  location: "",
  rating: 5,
  dressesListed: 0,
  completedSwaps: 0,
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [myDresses, setMyDresses] = useState<Dress[]>([])
  const [preferences, setPreferences] = useState<UserPreferences>({
    onboardingComplete: false,
    initialUploadsComplete: false,
  })

  const [feedDresses, setFeedDresses] = useState<Dress[]>([])
  const [session, setSession] = useState<SessionState>({
    outgoingLikes: [],
    incomingLikes: [],
    skippedIds: [],
    completedExchanges: 0,
  })

  const user: User = useMemo(
    () => (profile ? profileToUser(profile, myDresses.length) : EMPTY_USER),
    [profile, myDresses.length]
  )

  // Load the signed-in member's profile + wardrobe.
  useEffect(() => {
    let cancelled = false
    async function load() {
      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser) {
        if (!cancelled) setLoading(false)
        return
      }

      const { data: profileRow } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single()

      const [
        { data: dressRows },
        { data: communityRows },
        { data: likeRows },
        { data: requestRows },
      ] = await Promise.all([
          supabase
            .from("dresses")
            .select("*")
            .eq("owner_id", authUser.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("dresses")
            .select("*")
            .neq("owner_id", authUser.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("likes")
            .select("id, dress_id, status, created_at")
            .eq("liker_id", authUser.id),
          supabase
            .from("swap_requests")
            .select("id, requester_id, owner_id, dress_id, status, created_at, expires_at")
            .or(`owner_id.eq.${authUser.id},requester_id.eq.${authUser.id}`)
            .order("created_at", { ascending: false }),
        ])

      const communityOwnerIds = Array.from(
        new Set((communityRows ?? []).map((row) => row.owner_id))
      )
      const { data: communityProfiles } = communityOwnerIds.length
        ? await supabase
            .from("profiles")
            .select("*")
            .in("id", communityOwnerIds)
        : { data: [] as ProfileRow[] }
      const profileById = new Map(
        (communityProfiles as ProfileRow[]).map((row) => [row.id, row])
      )
      const requesterIds = Array.from(
        new Set((requestRows ?? []).map((row) => row.requester_id))
      )
      const { data: requesterProfiles } = requesterIds.length
        ? await supabase.from("profiles").select("*").in("id", requesterIds)
        : { data: [] as ProfileRow[] }
      for (const row of (requesterProfiles as ProfileRow[])) {
        profileById.set(row.id, row)
      }

      const requestIds = (requestRows ?? []).map((row) => row.id)
      const [{ data: messageRows }, { data: shippingRows }] = requestIds.length
        ? await Promise.all([
            supabase
              .from("swap_messages")
              .select("id, swap_request_id, sender_id, body, created_at")
              .in("swap_request_id", requestIds)
              .order("created_at", { ascending: true }),
            supabase
              .from("swap_shipping")
              .select("swap_request_id, carrier, tracking_number, status, shipping_paid_by, shipped_at, delivered_at, updated_at")
              .in("swap_request_id", requestIds),
          ])
        : [{ data: [] }, { data: [] }]
      const messagesByRequest = new Map<string, Message[]>()
      for (const row of messageRows ?? []) {
        const list = messagesByRequest.get(row.swap_request_id) ?? []
        list.push({
          id: row.id,
          senderId: row.sender_id,
          text: row.body,
          createdAt: new Date(row.created_at).getTime(),
        })
        messagesByRequest.set(row.swap_request_id, list)
      }
      const shippingByRequest = new Map(
        (shippingRows ?? []).map((row) => [row.swap_request_id, row])
      )

      if (cancelled) return

      if (profileRow) {
        const p = profileRow as ProfileRow
        setProfile(p)
        setPreferences(profileToPreferences(p))
        const owner = profileToUser(p, dressRows?.length ?? 0)
        setMyDresses(
          (dressRows as DressRow[] | null)?.map((r) =>
            dressRowToDress(r, owner)
          ) ?? []
        )

        const communityDresses = (communityRows as DressRow[] | null)?.flatMap(
          (row) => {
            const ownerRow = profileById.get(row.owner_id)
            return ownerRow
              ? [dressRowToDress(row, profileToUser(ownerRow, 0))]
              : []
          }
        ) ?? []
        setFeedDresses(communityDresses)

        const outgoingLikes = (likeRows ?? [])
          .map((like) => {
            const dress = communityDresses.find((item) => item.id === like.dress_id)
            return dress
              ? {
                  id: (requestRows ?? []).find((request) => request.dress_id === like.dress_id && request.requester_id === authUser.id)?.id ?? like.id,
                  dress,
                  status: like.status as OutgoingLike["status"],
                  createdAt: like.created_at,
                  messages: messagesByRequest.get(
                    (requestRows ?? []).find((request) => request.dress_id === like.dress_id && request.requester_id === authUser.id)?.id ?? ""
                  ) ?? [],
                }
              : null
          })
          .filter(Boolean) as OutgoingLike[]
        setSession((prev) => ({
          ...prev,
          outgoingLikes,
          incomingLikes: (requestRows ?? []).filter((row) => row.owner_id === authUser.id).flatMap((row) => {
            const requester = profileById.get(row.requester_id)
            const dress = (dressRows as DressRow[] | null)?.find((item) => item.id === row.dress_id)
            return requester && dress
              ? [{
                  id: row.id,
                  dress: dressRowToDress(dress, owner),
                  fromUser: profileToUser(requester, 0),
                  status: row.status as IncomingLike["status"],
                  createdAt: row.created_at,
                  messages: messagesByRequest.get(row.id) ?? [],
                  myLabel: shippingByRequest.get(row.id)
                    ? {
                        packageSize: dressRowToDress(dress, owner).packageSize,
                        carrier: shippingByRequest.get(row.id)?.carrier ?? undefined,
                        trackingNumber: shippingByRequest.get(row.id)?.tracking_number ?? undefined,
                        createdAt: shippingByRequest.get(row.id)?.updated_at ?? row.created_at,
                        status: shippingByRequest.get(row.id)?.status as ShippingLabel["status"],
                      }
                    : undefined,
                }]
              : []
          }),
        }))
      }
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null
    let active = true
    void supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!authUser || !active) return
      channel = supabase
        .channel(`swap-messages-${authUser.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "swap_messages" },
          (payload) => {
            const row = payload.new as { id: string; swap_request_id: string; sender_id: string; body: string; created_at: string }
            if (row.sender_id === authUser.id) return
            setSession((prev) => ({
              ...prev,
              incomingLikes: prev.incomingLikes.map((like) =>
                like.id === row.swap_request_id && !(like.messages ?? []).some((message) => message.id === row.id)
                  ? { ...like, messages: [...(like.messages ?? []), { id: row.id, senderId: row.sender_id, text: row.body, createdAt: new Date(row.created_at).getTime() }] }
                  : like
              ),
              outgoingLikes: prev.outgoingLikes.map((like) =>
                like.id === row.swap_request_id && !(like.messages ?? []).some((message) => message.id === row.id)
                  ? { ...like, messages: [...(like.messages ?? []), { id: row.id, senderId: row.sender_id, text: row.body, createdAt: new Date(row.created_at).getTime() }] }
                  : like
              ),
            }))
          }
        )
        .subscribe()
    })
    return () => {
      active = false
      if (channel) void supabase.removeChannel(channel)
    }
  }, [])

  const updatePreferences = useCallback(
    async (prefs: Partial<UserPreferences>) => {
      setPreferences((prev) => ({ ...prev, ...prefs }))
      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser) return
      const cols = preferencesToColumns(prefs)
      if (Object.keys(cols).length === 0) return
      const { data } = await supabase
        .from("profiles")
        .update(cols)
        .eq("id", authUser.id)
        .select("*")
        .single()
      if (data) setProfile(data as ProfileRow)
    },
    []
  )

  const addMyDress = useCallback(
    async (dress: Dress) => {
      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser) return
      const { data, error } = await supabase
        .from("dresses")
        .insert({
          owner_id: authUser.id,
          images: dress.images,
          brand: dress.brand,
          name: dress.name,
          size: dress.size,
          dress_code: dress.dressCode,
          condition: dress.condition,
          color: dress.color,
          package_size: dress.packageSize,
          notes: dress.notes ?? null,
        })
        .select("*")
        .single()
      if (error) {
        console.error("[v0] addMyDress error:", error)
        return
      }
      setMyDresses((prev) => [dressRowToDress(data as DressRow, user), ...prev])
    },
    [user]
  )

  const updateMyDress = useCallback(
    async (dress: Dress) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("dresses")
        .update({
          images: dress.images,
          brand: dress.brand,
          name: dress.name,
          size: dress.size,
          dress_code: dress.dressCode,
          condition: dress.condition,
          color: dress.color,
          package_size: dress.packageSize,
          notes: dress.notes ?? null,
        })
        .eq("id", dress.id)
        .select("*")
        .single()
      if (error) {
        console.error("[v0] updateMyDress error:", error)
        return
      }
      setMyDresses((prev) =>
        prev.map((d) =>
          d.id === dress.id ? dressRowToDress(data as DressRow, user) : d
        )
      )
    },
    [user]
  )

  const deleteMyDress = useCallback(async (dressId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("dresses").delete().eq("id", dressId)
    if (error) {
      console.error("[v0] deleteMyDress error:", error)
      return false
    }
    setMyDresses((prev) => prev.filter((dress) => dress.id !== dressId))
    setFeedDresses((prev) => prev.filter((dress) => dress.id !== dressId))
    setSession((prev) => ({
      ...prev,
      outgoingLikes: prev.outgoingLikes.filter((like) => like.dress.id !== dressId),
      incomingLikes: prev.incomingLikes.filter((like) => like.dress.id !== dressId),
    }))
    return true
  }, [])

  const signOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/auth/login"
  }, [])

  // ---- Session feed / match / chat / exchange logic ------------------------

  const likeDress = useCallback(async (dress: Dress) => {
    const supabase = createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    if (!authUser) return

    const { data, error } = await supabase
      .from("likes")
      .upsert(
        { liker_id: authUser.id, dress_id: dress.id, status: "pending" },
        { onConflict: "liker_id,dress_id" }
      )
      .select("id, status, created_at")
      .single()
    if (error || !data) {
      console.error("[v0] likeDress error:", error)
      return
    }

    const { error: requestError } = await supabase
      .from("swap_requests")
      .upsert(
        {
          requester_id: authUser.id,
          owner_id: dress.owner.id,
          dress_id: dress.id,
          status: "pending",
          expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        },
        { onConflict: "requester_id,dress_id" }
      )
    if (requestError) {
      console.error("[v0] swap request error:", requestError)
      return
    }

    const newLike: OutgoingLike = {
      id: data.id,
      dress,
      status: data.status as OutgoingLike["status"],
      createdAt: data.created_at,
    }
    setSession((prev) => ({
      ...prev,
      outgoingLikes: [
        ...prev.outgoingLikes.filter((item) => item.dress.id !== dress.id),
        newLike,
      ],
      skippedIds: prev.skippedIds.filter((id) => id !== dress.id),
    }))
  }, [])

  const skipDress = useCallback((dressId: string) => {
    setSession((prev) => ({
      ...prev,
      skippedIds: [...prev.skippedIds, dressId],
    }))
  }, [])

  const removeOutgoingLike = useCallback(async (likeId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("likes").delete().eq("id", likeId)
    if (error) {
      console.error("[v0] removeOutgoingLike error:", error)
      return
    }
    setSession((prev) => ({
      ...prev,
      outgoingLikes: prev.outgoingLikes.filter((o) => o.id !== likeId),
    }))
  }, [])

  const acceptIncoming = useCallback(async (likeId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("swap_requests")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", likeId)
    if (error) {
      console.error("[v0] acceptIncoming error:", error)
      return
    }
    await supabase.from("swap_shipping").upsert({
      swap_request_id: likeId,
      status: "arrange_manually",
    })
    setSession((prev) => ({
      ...prev,
      incomingLikes: prev.incomingLikes.map((l) =>
        l.id === likeId
          ? {
              ...l,
              status: "accepted",
              messages:
                l.messages.length > 0
                  ? l.messages
                  : [
                      {
                        id: `msg-${Date.now()}`,
                        senderId: l.fromUser.id,
                        text: `Hi! I'd love to swap for your ${l.dress.name}. Looking forward to it!`,
                        createdAt: Date.now(),
                      },
                    ],
            }
          : l
      ),
    }))
  }, [])

  const declineIncoming = useCallback(async (likeId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("swap_requests")
      .update({ status: "declined", updated_at: new Date().toISOString() })
      .eq("id", likeId)
    if (error) {
      console.error("[v0] declineIncoming error:", error)
      return
    }
    setSession((prev) => ({
      ...prev,
      incomingLikes: prev.incomingLikes.map((l) =>
        l.id === likeId ? { ...l, status: "declined" } : l
      ),
    }))
  }, [])

  const sendMessage = useCallback(
    async (likeId: string, text: string) => {
      if (!text.trim()) return
      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser) return
      const { data, error } = await supabase
        .from("swap_messages")
        .insert({ swap_request_id: likeId, sender_id: authUser.id, body: text.trim() })
        .select("id, sender_id, body, created_at")
        .single()
      if (error || !data) {
        console.error("[v0] sendMessage error:", error)
        return
      }
      setSession((prev) => ({
        ...prev,
        incomingLikes: prev.incomingLikes.map((l) =>
          l.id === likeId
            ? {
                ...l,
                messages: [
                  ...l.messages,
                  {
                    id: data.id,
                    senderId: data.sender_id,
                    text: data.body,
                    createdAt: new Date(data.created_at).getTime(),
                  },
                ],
              }
            : l
        ),
      }))
    },
    [user.id]
  )

  const confirmExchange = useCallback(
    (likeId: string) => {
      setSession((prev) => {
        const available = myDresses.length - prev.completedExchanges
        if (available <= 0) return prev
        const shipBy = new Date(Date.now() + SHIP_WINDOW_DAYS * 86400000)
          .toISOString()
          .split("T")[0]
        const incomingLikes = prev.incomingLikes.map((l) => {
          if (l.id !== likeId || l.exchange) return l
          const exchange: ExchangeState = {
            iConfirmed: true,
            theyConfirmed: true,
            shipByDate: shipBy,
            theirTracking: makeTrackingNumber(),
          }
          return { ...l, status: "accepted" as const, exchange }
        })
        return { ...prev, incomingLikes }
      })
    },
    [myDresses.length]
  )

  const generateLabel = useCallback(async (likeId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("swap_shipping").upsert({
      swap_request_id: likeId,
      status: "arrange_manually",
      updated_at: new Date().toISOString(),
    })
    if (error) {
      console.error("[v0] generateLabel error:", error)
      return
    }
    setSession((prev) => ({
      ...prev,
      incomingLikes: prev.incomingLikes.map((like) =>
        like.id === likeId
          ? {
              ...like,
              myLabel: like.myLabel ?? {
                packageSize: like.dress.packageSize,
                createdAt: new Date().toISOString(),
                status: "arrange_manually",
              },
            }
          : like
      ),
    }))
  }, [])

  const uploadMyTracking = useCallback(async (likeId: string, tracking: string) => {
    if (!tracking.trim()) return
    const supabase = createClient()
    const { error } = await supabase
      .from("swap_shipping")
      .upsert({
        swap_request_id: likeId,
        tracking_number: tracking.trim(),
        status: "shipped",
        shipped_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    if (error) {
      console.error("[v0] uploadMyTracking error:", error)
      return
    }
    setSession((prev) => {
      let didComplete = false
      const incomingLikes = prev.incomingLikes.map((l) => {
        if (l.id !== likeId || !l.exchange || l.exchange.myTracking) return l
        didComplete = true
        return {
          ...l,
          status: "completed" as const,
          exchange: { ...l.exchange, myTracking: tracking.trim() },
        }
      })
      return {
        ...prev,
        incomingLikes,
        completedExchanges: didComplete
          ? prev.completedExchanges + 1
          : prev.completedExchanges,
      }
    })
  }, [])

  const availableDresses = useMemo(
    () =>
      feedDresses.filter(
        (d) =>
          !session.outgoingLikes.some((o) => o.dress.id === d.id) &&
          !session.skippedIds.includes(d.id)
      ),
    [feedDresses, session.outgoingLikes, session.skippedIds]
  )

  const isMutualWithUser = useCallback(
    (userId: string) => {
      const theyLikedMine = session.incomingLikes.some(
        (l) => l.fromUser.id === userId && l.status !== "declined"
      )
      const iLikedTheirs = session.outgoingLikes.some(
        (o) => o.dress.owner.id === userId
      )
      return theyLikedMine && iLikedTheirs
    },
    [session.incomingLikes, session.outgoingLikes]
  )

  const availableSwaps = myDresses.length - session.completedExchanges
  const canStartSwap = availableSwaps > 0

  return (
    <AppContext.Provider
      value={{
        loading,
        user,
        myDresses,
        preferences,
        dresses: feedDresses,
        outgoingLikes: session.outgoingLikes,
        incomingLikes: session.incomingLikes,
        skippedIds: session.skippedIds,
        completedExchanges: session.completedExchanges,
        availableDresses,
        likeDress,
        skipDress,
        removeOutgoingLike,
        addMyDress,
        updateMyDress,
        deleteMyDress,
        acceptIncoming,
        declineIncoming,
        sendMessage,
        confirmExchange,
        uploadMyTracking,
        generateLabel,
        shipWindowDays: SHIP_WINDOW_DAYS,
        isMutualWithUser,
        availableSwaps,
        canStartSwap,
        updatePreferences,
        signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
