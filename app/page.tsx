'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Upload, Filter, GitMerge, FileText, Download, TrendingUp, Rocket, ArrowRight } from 'lucide-react'
import { storage } from '@/lib/storage'
import { Product, Quote } from '@/lib/types'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setProducts(storage.getProducts())
    setQuotes(storage.getQuotes())
  }

  const getLatestUpdate = () => {
    if (products.length === 0) return null
    
    const latestProduct = products.reduce((latest, product) => {
      return new Date(product.updatedAt) > new Date(latest.updatedAt) ? product : latest
    })
    
    return new Date(latestProduct.updatedAt)
  }

  const latestUpdate = getLatestUpdate()
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        ダッシュボード
      </h1>
      
      <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">登録商品数</h3>
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{products.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {products.length === 0 ? '商品データなし' : `${products.length} 件の商品が登録済み`}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">作成済み見積</h3>
            <FileText className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{quotes.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {quotes.length === 0 ? '見積データなし' : `${quotes.length} 件の見積が作成済み`}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">最終更新</h3>
            <Upload className="h-6 w-6 text-purple-500" />
          </div>
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {latestUpdate ? format(latestUpdate, 'MM/dd HH:mm') : '-'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {latestUpdate 
              ? format(latestUpdate, 'yyyy年MM月dd日', { locale: ja })
              : 'データ未登録'
            }
          </p>
        </div>
      </div>

      {/* はじめかたガイド - データがない場合のみ表示 */}
      {products.length === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-8 mb-8 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-full">
              <Rocket className="h-8 w-8 text-blue-600 dark:text-blue-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white ml-4">
              Excel価格管理システムの始め方
            </h2>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-center mb-8 max-w-2xl mx-auto">
            初回利用の方は、以下の手順でサンプルデータを使って機能をお試しください
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  サンプルデータダウンロード
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  インポート画面でサンプルExcelファイルをダウンロード
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  データインポート
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ダウンロードしたファイルをそのままアップロード
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  商品データ確認
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  商品管理画面でサンプルデータを確認
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Link
              href="/import"
              className="inline-flex items-center px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Upload className="h-5 w-5 mr-2" />
              データインポート画面へ
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">クイックアクセス</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/import" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700 hover:shadow-md dark:hover:shadow-gray-600 transition-shadow">
          <Upload className="h-8 w-8 text-blue-600 mb-3" />
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">データインポート</h3>
          <p className="text-gray-600 dark:text-gray-400">Excelファイルをアップロードしてデータを取り込みます</p>
        </Link>
        
        <Link href="/products" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700 hover:shadow-md dark:hover:shadow-gray-600 transition-shadow">
          <Filter className="h-8 w-8 text-green-600 mb-3" />
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">価格管理</h3>
          <p className="text-gray-600 dark:text-gray-400">商品の価格を一括で編集・更新できます</p>
        </Link>
        
        <Link href="/merge" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700 hover:shadow-md dark:hover:shadow-gray-600 transition-shadow">
          <GitMerge className="h-8 w-8 text-purple-600 mb-3" />
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">データ統合</h3>
          <p className="text-gray-600 dark:text-gray-400">重複したレコードを統合して整理します</p>
        </Link>
        
        <Link href="/quotes" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700 hover:shadow-md dark:hover:shadow-gray-600 transition-shadow">
          <FileText className="h-8 w-8 text-orange-600 mb-3" />
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">見積作成</h3>
          <p className="text-gray-600 dark:text-gray-400">顧客向けの見積書を簡単に作成できます</p>
        </Link>
        
        <Link href="/export" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700 hover:shadow-md dark:hover:shadow-gray-600 transition-shadow">
          <Download className="h-8 w-8 text-red-600 mb-3" />
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">エクスポート</h3>
          <p className="text-gray-600 dark:text-gray-400">データをExcel形式でダウンロードします</p>
        </Link>
      </div>
    </div>
  )
}