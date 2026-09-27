import type {
  DressSize,
  DressCode,
  DressCondition,
  DressColor,
  PackageSize,
} from "./types"

export const DRESS_SIZES: DressSize[] = [
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
]

export const DRESS_CODES: DressCode[] = [
  "Black Tie",
  "Cocktail",
  "Semi-Formal",
  "Garden Party",
  "All",
  "Other",
]

export const DRESS_CONDITIONS: DressCondition[] = [
  "Excellent",
  "Good",
  "Fair",
]

export const DRESS_COLORS: DressColor[] = [
  "Black",
  "White",
  "Gray",
  "Beige",
  "Brown",
  "Red",
  "Pink",
  "Orange",
  "Yellow",
  "Green",
  "Blue",
  "Purple",
  "Multicolor",
  "Other",
]

export const PACKAGE_SIZES: {
  value: PackageSize
  label: string
  weight: string
  description: string
}[] = [
  {
    value: "light",
    label: "Light",
    weight: "Up to 5kg",
    description: "Single lightweight dress",
  },
  {
    value: "medium",
    label: "Medium",
    weight: "Up to 10kg",
    description: "Heavier or layered dress",
  },
  {
    value: "large",
    label: "Large",
    weight: "Up to 20kg",
    description: "Bulky gown or multiple pieces",
  },
]

export const EUROPEAN_CITIES: string[] = [
  // Germany — major cities
  "Berlin, Germany",
  "Hamburg, Germany",
  "Munich, Germany",
  "Cologne, Germany",
  "Frankfurt, Germany",
  "Stuttgart, Germany",
  "Düsseldorf, Germany",
  "Leipzig, Germany",
  "Dortmund, Germany",
  "Essen, Germany",
  "Bremen, Germany",
  "Dresden, Germany",
  "Hanover, Germany",
  "Nuremberg, Germany",
  "Duisburg, Germany",
  "Bochum, Germany",
  "Wuppertal, Germany",
  "Bielefeld, Germany",
  "Bonn, Germany",
  "Münster, Germany",
  "Karlsruhe, Germany",
  "Mannheim, Germany",
  "Augsburg, Germany",
  "Wiesbaden, Germany",
  "Mönchengladbach, Germany",
  "Gelsenkirchen, Germany",
  "Aachen, Germany",
  "Braunschweig, Germany",
  "Kiel, Germany",
  "Freiburg, Germany",
]

export const SERVICE_FEE_PERCENT = 10
export const SHIPPING_FEE = 12.99

export const SWIPE_THRESHOLD = 100
export const SWIPE_VELOCITY_THRESHOLD = 0.3
