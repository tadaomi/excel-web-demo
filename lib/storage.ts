import { Product, Quote } from './types'

const PRODUCTS_KEY = 'excel-web-demo-products'
const QUOTES_KEY = 'excel-web-demo-quotes'

export const storage = {
  // Products
  getProducts(): Product[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(PRODUCTS_KEY)
    return data ? JSON.parse(data) : []
  },
  
  setProducts(products: Product[]) {
    if (typeof window === 'undefined') return
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
  },
  
  addProducts(newProducts: Product[]) {
    const existingProducts = this.getProducts()
    const updatedProducts = [...existingProducts, ...newProducts]
    this.setProducts(updatedProducts)
  },
  
  updateProduct(id: string, updates: Partial<Product>) {
    const products = this.getProducts()
    const index = products.findIndex(p => p.id === id)
    if (index !== -1) {
      products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() }
      this.setProducts(products)
    }
  },
  
  deleteProduct(id: string) {
    const products = this.getProducts()
    const filteredProducts = products.filter(p => p.id !== id)
    this.setProducts(filteredProducts)
  },
  
  // Quotes
  getQuotes(): Quote[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(QUOTES_KEY)
    return data ? JSON.parse(data) : []
  },
  
  setQuotes(quotes: Quote[]) {
    if (typeof window === 'undefined') return
    localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes))
  },
  
  addQuote(quote: Quote) {
    const quotes = this.getQuotes()
    quotes.push(quote)
    this.setQuotes(quotes)
  },
  
  updateQuote(id: string, updates: Partial<Quote>) {
    const quotes = this.getQuotes()
    const index = quotes.findIndex(q => q.id === id)
    if (index !== -1) {
      quotes[index] = { ...quotes[index], ...updates }
      this.setQuotes(quotes)
    }
  },
  
  deleteQuote(id: string) {
    const quotes = this.getQuotes()
    const filteredQuotes = quotes.filter(q => q.id !== id)
    this.setQuotes(filteredQuotes)
  },
  
  // Clear all data
  clearAll() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(PRODUCTS_KEY)
    localStorage.removeItem(QUOTES_KEY)
  }
}