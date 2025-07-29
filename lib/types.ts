export interface Product {
  id: string
  name: string
  category: string
  basePrice: number
  discountRate?: number
  taxRate: number
  updatedAt: string
}

export interface QuoteItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discountRate?: number
  amount: number
}

export interface Quote {
  id: string
  customerName: string
  items: QuoteItem[]
  subtotal: number
  tax: number
  totalAmount: number
  createdAt: string
}

export interface FilterConfig {
  category?: string
  minPrice?: number
  maxPrice?: number
  searchTerm?: string
}