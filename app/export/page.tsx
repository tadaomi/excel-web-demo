'use client'

import { useState, useEffect } from 'react'
import { Download, FileSpreadsheet, FileText, Package } from 'lucide-react'
import { storage } from '@/lib/storage'
import { createExcelFile } from '@/lib/excel-utils'
import { createQuoteExcelFile, createAllQuotesExcelFile } from '@/lib/quote-excel-utils'
import { Product, Quote } from '@/lib/types'
import { format } from 'date-fns'

export default function ExportPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setProducts(storage.getProducts())
    setQuotes(storage.getQuotes())
  }

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const exportProducts = () => {
    if (products.length === 0) return
    
    const blob = createExcelFile(products)
    const filename = `商品データ_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`
    downloadFile(blob, filename)
  }

  const exportQuote = (quote: Quote) => {
    const blob = createQuoteExcelFile(quote)
    const filename = `見積書_${quote.customerName}_${format(new Date(quote.createdAt), 'yyyyMMdd')}.xlsx`
    downloadFile(blob, filename)
  }

  const exportAllQuotes = () => {
    if (quotes.length === 0) return
    
    const blob = createAllQuotesExcelFile(quotes)
    const filename = `見積一覧_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`
    downloadFile(blob, filename)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">データエクスポート</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 商品データエクスポート */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">商品データ</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{products.length} 件の商品</p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              登録されているすべての商品データをExcel形式でエクスポートします。
            </p>
            
            <button
              onClick={exportProducts}
              disabled={products.length === 0}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium ${
                products.length > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Download className="h-4 w-4" />
              <span>商品データをダウンロード</span>
            </button>
          </div>
        </div>

        {/* 見積データエクスポート */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-green-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">見積一覧</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{quotes.length} 件の見積</p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              作成したすべての見積データの一覧をExcel形式でエクスポートします。
            </p>
            
            <button
              onClick={exportAllQuotes}
              disabled={quotes.length === 0}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium ${
                quotes.length > 0
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Download className="h-4 w-4" />
              <span>見積一覧をダウンロード</span>
            </button>
          </div>
        </div>
      </div>

      {/* 個別見積ダウンロード */}
      {quotes.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">個別見積書</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {quotes.map(quote => (
                <div key={quote.id} className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{quote.customerName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      作成日: {format(new Date(quote.createdAt), 'yyyy年MM月dd日')} | 
                      合計: ¥{quote.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => exportQuote(quote)}
                    className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Excel出力</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {products.length === 0 && quotes.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            エクスポート可能なデータがありません。<br />
            まずは商品データをインポートするか、見積を作成してください。
          </p>
        </div>
      )}
    </div>
  )
}