'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Upload, FileSpreadsheet, XCircle, Download, HelpCircle } from 'lucide-react'
import { parseExcelFile } from '@/lib/excel-utils'
import { storage } from '@/lib/storage'
import { downloadTemplate } from '@/lib/template-utils'
import { Product } from '@/lib/types'

export default function ImportPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<Product[]>([])
  const [fileName, setFileName] = useState<string>('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsLoading(true)
    setError(null)
    setFileName(file.name)

    try {
      const products = await parseExcelFile(file)
      setPreview(products)
    } catch (err) {
      setError('ファイルの読み込みに失敗しました。Excelファイルを確認してください。')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  })

  const handleImport = () => {
    if (preview.length === 0) return

    storage.setProducts(preview)
    router.push('/products')
  }

  const handleCancel = () => {
    setPreview([])
    setFileName('')
    setError(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">データインポート</h1>

      {/* ヘルプセクション */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
        <div className="flex items-start">
          <HelpCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="ml-3">
            <h2 className="text-lg font-medium text-blue-900 dark:text-blue-300 mb-2">
              Excelファイルの準備
            </h2>
            <div className="text-blue-800 dark:text-blue-300 space-y-2">
              <p>
                <strong>必須列:</strong> 商品名、カテゴリ、基本価格、税率（割引率は任意）
              </p>
              <p>
                <strong>対応形式:</strong> .xlsx、.xls（最大10MB）
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-600 dark:bg-blue-700 text-white text-sm rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
                >
                  <Download className="h-4 w-4" />
                  <span>テンプレートをダウンロード</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {preview.length === 0 ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isDragActive
              ? 'ファイルをドロップしてください'
              : 'Excelファイルをドラッグ&ドロップ'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            または クリックしてファイルを選択
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            対応形式: .xlsx, .xls
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700">
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="h-6 w-6 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">{fileName}</p>
                  <p className="text-sm text-gray-500">
                    {preview.length} 件の商品データ
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleImport}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  インポート実行
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              プレビュー（最初の5件）
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      商品名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      カテゴリ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      基本価格
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      割引率
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      税率
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preview.slice(0, 5).map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ¥{product.basePrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.discountRate ? `${product.discountRate}%` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(product.taxRate * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.length > 5 && (
              <p className="mt-4 text-sm text-gray-500 text-center">
                他 {preview.length - 5} 件のデータ
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="ml-3 text-sm text-blue-800">ファイルを読み込んでいます...</p>
          </div>
        </div>
      )}
    </div>
  )
}