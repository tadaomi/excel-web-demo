'use client'

import { useState, useEffect } from 'react'
import { GitMerge, AlertCircle, CheckCircle } from 'lucide-react'
import { storage } from '@/lib/storage'
import { Product } from '@/lib/types'

interface DuplicateGroup {
  key: string
  products: Product[]
}

export default function MergePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([])
  const [mergeStrategy, setMergeStrategy] = useState<'keep-first' | 'keep-latest' | 'keep-highest-price'>('keep-latest')
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = () => {
    const data = storage.getProducts()
    setProducts(data)
    findDuplicates(data)
  }

  const findDuplicates = (productList: Product[]) => {
    const groups = new Map<string, Product[]>()
    
    productList.forEach(product => {
      const key = `${product.name.toLowerCase().trim()}-${product.category.toLowerCase().trim()}`
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(product)
    })
    
    const duplicates: DuplicateGroup[] = []
    groups.forEach((products, key) => {
      if (products.length > 1) {
        duplicates.push({ key, products })
      }
    })
    
    setDuplicateGroups(duplicates)
  }

  const toggleGroupSelection = (key: string) => {
    const newSelection = new Set(selectedGroups)
    if (newSelection.has(key)) {
      newSelection.delete(key)
    } else {
      newSelection.add(key)
    }
    setSelectedGroups(newSelection)
  }

  const toggleAllGroups = () => {
    if (selectedGroups.size === duplicateGroups.length) {
      setSelectedGroups(new Set())
    } else {
      setSelectedGroups(new Set(duplicateGroups.map(g => g.key)))
    }
  }

  const getProductToKeep = (products: Product[]): Product => {
    switch (mergeStrategy) {
      case 'keep-first':
        return products[0]
      case 'keep-latest':
        return products.reduce((latest, current) => 
          new Date(current.updatedAt) > new Date(latest.updatedAt) ? current : latest
        )
      case 'keep-highest-price':
        return products.reduce((highest, current) => 
          current.basePrice > highest.basePrice ? current : highest
        )
      default:
        return products[0]
    }
  }

  const executeMerge = () => {
    if (selectedGroups.size === 0) return
    
    const groupsToMerge = duplicateGroups.filter(g => selectedGroups.has(g.key))
    const idsToDelete = new Set<string>()
    const productsToKeep: Product[] = []
    
    groupsToMerge.forEach(group => {
      const keeper = getProductToKeep(group.products)
      productsToKeep.push(keeper)
      group.products.forEach(p => {
        if (p.id !== keeper.id) {
          idsToDelete.add(p.id)
        }
      })
    })
    
    const newProducts = products.filter(p => !idsToDelete.has(p.id))
    storage.setProducts(newProducts)
    
    setSelectedGroups(new Set())
    loadProducts()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">データ統合</h1>

      {duplicateGroups.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-12 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            重複データは見つかりませんでした
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            すべての商品データは一意です
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 mb-6">
            <div className="p-6 border-b dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    統合設定
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {duplicateGroups.length} 組の重複データが見つかりました
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={mergeStrategy}
                    onChange={(e) => setMergeStrategy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="keep-latest">最新のデータを保持</option>
                    <option value="keep-first">最初のデータを保持</option>
                    <option value="keep-highest-price">最高価格を保持</option>
                  </select>
                  <button
                    onClick={executeMerge}
                    disabled={selectedGroups.size === 0}
                    className={`px-4 py-2 rounded-md font-medium ${
                      selectedGroups.size > 0
                        ? 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <GitMerge className="h-4 w-4 inline-block mr-2" />
                    選択した項目を統合 ({selectedGroups.size})
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  重複データグループ
                </h3>
                <button
                  onClick={toggleAllGroups}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  {selectedGroups.size === duplicateGroups.length ? 'すべて解除' : 'すべて選択'}
                </button>
              </div>

              <div className="space-y-4">
                {duplicateGroups.map((group) => (
                  <div
                    key={group.key}
                    className={`border rounded-lg p-4 ${
                      selectedGroups.has(group.key)
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={selectedGroups.has(group.key)}
                        onChange={() => toggleGroupSelection(group.key)}
                        className="mt-1 h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {group.products[0].name} - {group.products[0].category}
                          </h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {group.products.length} 件の重複
                          </span>
                        </div>
                        <div className="space-y-2">
                          {group.products.map((product) => (
                            <div
                              key={product.id}
                              className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 rounded p-2"
                            >
                              <div className="flex justify-between">
                                <span>ID: {product.id}</span>
                                <span>¥{product.basePrice.toLocaleString()}</span>
                                <span>更新: {new Date(product.updatedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-amber-400 dark:text-amber-300 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  統合を実行すると、選択されたグループ内の重複データが1つに統合されます。
                  この操作は元に戻すことができません。
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}