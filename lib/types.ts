export type DressSize = "XXS" | "XS" | "S" | "M" | "L" | "XL" | "XXL"

export type DressCode =
  | "Black Tie"
  | "Cocktail"
  | "Semi-Formal"
  | "Garden Party"
  | "All"
  | "Other"
  | "Beach"
  | "Casual"

export type DressCondition = "Excellent" | "Good" | "Fair"

export type DressColor =
  | "Black"
  | "White"
  | "Ivory"
  | "Cream"
  | "Beige"
  | "Brown"
  | "Gray"
  | "Champagne"
  | "Pink"
  | "Blush Pink"
  | "Red"
  | "Burgundy"
  | "Orange"
  | "Coral"
  | "Yellow"
  | "Navy"
  | "Blue"
  | "Royal Blue"
  | "Light Blue"
  | "Green"
  | "Sage Green"
  | "Emerald"
  | "Purple"
  | "Lavender"
  | "Plum"
  | "Gold"
  | "Silver"
  | "Colorful"
  | "Multicolor"
  | "Floral Print"
  | "Other"

export type PackageSize = "light" | "medium" | "large"

export type LikeStatus = "pending" | "accepted" | "declined" | "expired" | "completed"

export interface User {
  id: string
  name: string
  avatar: string
  location: string
  address?: string
  rating: number
  dressesListed: number
  completedSwaps: number
}

export interface Dress {
  id: string
  owner: User
  images: string[]
  brand: string
  name: string
  size: DressSize
  dressCode: DressCode
  condition: DressCondition
  color: string
  packageSize: PackageSize
  notes?: string
  createdAt: string
}

export interface ShippingLabel {
  /** Manual shipping details for now; provider fields can be added later. */
  trackingNumber?: string
  packageSize: PackageSize
  carrier?: string
  createdAt: string
  status?: "arrange_manually" | "shipped"
}

export interface Message {
  id: string
  senderId: string
  text: string
  createdAt: number
}

// Staged transaction for a mutual match
// confirm -> ship (address + 4 day deadline) -> done (both tracking uploaded)
export interface ExchangeState {
  iConfirmed: boolean
  theyConfirmed: boolean
  shipByDate?: string // ISO date, 4 days after both confirm
  myTracking?: string // tracking for the dress I send
  theirTracking?: string // tracking for the dress they send me
}

// Someone swiped right on one of MY dresses (incoming interest)
export interface IncomingLike {
  id: string
  dress: Dress // a dress from my collection
  fromUser: User // the user who liked it
  status: LikeStatus
  createdAt: string
  messages: Message[]
  myLabel?: ShippingLabel // label for me to send my dress
  exchange?: ExchangeState // present once a mutual swap is arranged
}

// A dress I swiped right on (outgoing interest)
export interface OutgoingLike {
  id: string
  dress: Dress // a dress owned by another user
  status: LikeStatus
  createdAt: string
  messages?: Message[]
}

export interface UserPreferences {
  userName?: string
  firstName?: string
  lastName?: string
  dateOfBirth?: string // ISO date (yyyy-mm-dd)
  age?: number
  eventDate?: string
  eventLocation?: string
  sizes?: DressSize[]
  dressCodes?: DressCode[]
  onboardingComplete: boolean
  initialUploadsComplete: boolean
}
