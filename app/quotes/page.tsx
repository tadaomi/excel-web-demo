'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, FileText, Search, Printer } from 'lucide-react'
import { storage } from '@/lib/storage'
import { Product, Quote, QuoteItem } from '@/lib/types'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function QuotesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  
  // 新規見積フォーム
  const [customerName, setCustomerName] = useState('')
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts([])
    }
  }, [searchTerm, products])

  const loadData = () => {
    setProducts(storage.getProducts())
    setQuotes(storage.getQuotes())
  }

  const addProductToQuote = (product: Product) => {
    const existingItem = quoteItems.find(item => item.productId === product.id)
    
    if (existingItem) {
      // 既存の商品なら数量を増やす
      setQuoteItems(items => 
        items.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1, amount: (item.quantity + 1) * item.unitPrice }
            : item
        )
      )
    } else {
      // 新規商品を追加
      const newItem: QuoteItem = {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.basePrice * (1 - (product.discountRate || 0) / 100),
        discountRate: product.discountRate,
        amount: product.basePrice * (1 - (product.discountRate || 0) / 100)
      }
      setQuoteItems([...quoteItems, newItem])
    }
    
    setSearchTerm('')
  }

  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    
    setQuoteItems(items => 
      items.map(item => 
        item.productId === productId 
          ? { ...item, quantity, amount: quantity * item.unitPrice }
          : item
      )
    )
  }

  const removeItem = (productId: string) => {
    setQuoteItems(items => items.filter(item => item.productId !== productId))
  }

  const calculateTotals = () => {
    const subtotal = quoteItems.reduce((sum, item) => sum + item.amount, 0)
    const tax = subtotal * 0.1 // 10%の消費税
    const totalAmount = subtotal + tax
    return { subtotal, tax, totalAmount }
  }

  const createQuote = () => {
    if (!customerName || quoteItems.length === 0) return
    
    const { subtotal, tax, totalAmount } = calculateTotals()
    const newQuote: Quote = {
      id: `quote-${Date.now()}`,
      customerName,
      items: quoteItems,
      subtotal,
      tax,
      totalAmount,
      createdAt: new Date().toISOString()
    }
    
    storage.addQuote(newQuote)
    
    // フォームをリセット
    setCustomerName('')
    setQuoteItems([])
    setIsCreating(false)
    loadData()
  }

  const deleteQuote = (id: string) => {
    if (confirm('この見積を削除してもよろしいですか？')) {
      storage.deleteQuote(id)
      loadData()
    }
  }

  const startNewQuote = () => {
    setIsCreating(true)
    setCustomerName('')
    setQuoteItems([])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">見積作成</h1>
        {!isCreating && (
          <button
            onClick={startNewQuote}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            <Plus className="h-4 w-4" />
            <span>新規見積作成</span>
          </button>
        )}
      </div>

      {isCreating ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700">
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">新規見積作成</h2>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                顧客名
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="顧客名を入力..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                商品検索
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="商品名またはカテゴリで検索..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {filteredProducts.length > 0 && (
                <div className="mt-2 border border-gray-200 dark:border-gray-600 rounded-md max-h-48 overflow-y-auto bg-white dark:bg-gray-700">
                  {filteredProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => addProductToQuote(product)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 border-b dark:border-gray-600 last:border-b-0"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">{product.name}</span>
                        <span className="text-gray-500 dark:text-gray-400">¥{product.basePrice.toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{product.category}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {quoteItems.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">見積明細</h3>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">商品名</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">単価</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">数量</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">金額</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {quoteItems.map(item => (
                      <tr key={item.productId}>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{item.productName}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">¥{item.unitPrice.toLocaleString()}</td>
                        <td className="px-4 py-2 text-sm">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                          />
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">¥{item.amount.toLocaleString()}</td>
                        <td className="px-4 py-2 text-sm">
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="mt-4 space-y-2 text-right">
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">小計: </span>
                    <span className="font-medium text-gray-900 dark:text-white">¥{calculateTotals().subtotal.toLocaleString()}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">消費税 (10%): </span>
                    <span className="font-medium text-gray-900 dark:text-white">¥{calculateTotals().tax.toLocaleString()}</span>
                  </div>
                  <div className="text-lg font-bold">
                    <span className="text-gray-900 dark:text-white">合計: </span>
                    <span className="text-gray-900 dark:text-white">¥{calculateTotals().totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                キャンセル
              </button>
              <button
                onClick={createQuote}
                disabled={!customerName || quoteItems.length === 0}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  customerName && quoteItems.length > 0
                    ? 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600'
                    : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                }`}
              >
                見積作成
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">見積データがありません</p>
              <button
                onClick={startNewQuote}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                <Plus className="h-4 w-4" />
                <span>最初の見積を作成する</span>
              </button>
            </div>
          ) : (
            quotes.map(quote => (
              <div key={quote.id} className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{quote.customerName}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        作成日: {format(new Date(quote.createdAt), 'yyyy年MM月dd日', { locale: ja })}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => deleteQuote(quote.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="border-t dark:border-gray-700 pt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">明細: {quote.items.length} 件</p>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ¥{quote.totalAmount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">（税込）</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}