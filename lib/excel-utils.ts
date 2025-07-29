import * as XLSX from 'xlsx'
import { Product } from './types'

export function parseExcelFile(file: File): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        
        // 最初のシートを取得
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        
        // JSONに変換
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        // Product型に変換
        const products: Product[] = jsonData.map((row: any, index) => ({
          id: row.id || `product-${Date.now()}-${index}`,
          name: row.商品名 || row.name || '',
          category: row.カテゴリ || row.category || '',
          basePrice: parseFloat(row.基本価格 || row.basePrice || 0),
          discountRate: row.割引率 || row.discountRate ? parseFloat(row.割引率 || row.discountRate) : undefined,
          taxRate: parseFloat(row.税率 || row.taxRate || 0.1),
          updatedAt: new Date().toISOString(),
        }))
        
        resolve(products)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = (error) => reject(error)
    reader.readAsBinaryString(file)
  })
}

export function createExcelFile(products: Product[]): Blob {
  // データを整形
  const data = products.map(product => ({
    ID: product.id,
    商品名: product.name,
    カテゴリ: product.category,
    基本価格: product.basePrice,
    割引率: product.discountRate || '',
    税率: product.taxRate,
    更新日時: product.updatedAt,
  }))
  
  // ワークシートを作成
  const worksheet = XLSX.utils.json_to_sheet(data)
  
  // ワークブックを作成
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '商品データ')
  
  // バイナリデータに変換
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' })
  
  // Blobに変換
  const buf = new ArrayBuffer(wbout.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i < wbout.length; i++) {
    view[i] = wbout.charCodeAt(i) & 0xFF
  }
  
  return new Blob([buf], { type: 'application/octet-stream' })
}