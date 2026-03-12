export const productTypeOptions = [
  { title: 'Bakery', value: 'bakery' },
  { title: 'Beverage', value: 'beverage' },
  { title: 'Dairy', value: 'dairy' },
  { title: 'Grains', value: 'grains' },
  { title: 'Fruits', value: 'fruits' },
  { title: 'Vegetables', value: 'vegetables' },
  { title: 'Snacks', value: 'snacks' },
  { title: 'Frozen', value: 'frozen' },
  { title: 'Meat', value: 'meat' },
  { title: 'Seafood', value: 'seafood' },
  { title: 'Other', value: 'other' },
] as const

const productTypeIconMap: Record<string, string> = {
  bakery: 'mdi-baguette',
  beverage: 'mdi-cup',
  dairy: 'mdi-cow',
  grains: 'mdi-grain',
  fruits: 'mdi-food-apple',
  vegetables: 'mdi-food-apple-outline',
  snacks: 'mdi-food-croissant',
  frozen: 'mdi-snowflake',
  meat: 'mdi-food-steak',
  seafood: 'mdi-fish',
  other: 'mdi-package-variant-closed',
}

export const normalizeProductType = (type: string | undefined | null) => {
  const value = String(type ?? 'other')
    .trim()
    .toLowerCase()
  return value in productTypeIconMap ? value : 'other'
}

export const getProductIconByType = (type: string | undefined | null) => {
  const normalizedType = normalizeProductType(type)
  return productTypeIconMap[normalizedType]
}
