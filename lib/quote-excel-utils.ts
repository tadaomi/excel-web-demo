import * as XLSX from 'xlsx'
import { Quote } from './types'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export function createQuoteExcelFile(quote: Quote): Blob {
  // ワークブックを作成
  const workbook = XLSX.utils.book_new()
  
  // 見積データを作成
  const quoteData = [
    ['見積書'],
    [],
    ['顧客名:', quote.customerName],
    ['作成日:', format(new Date(quote.createdAt), 'yyyy年MM月dd日', { locale: ja })],
    [],
    ['商品名', '単価', '数量', '金額'],
  ]
  
  // 明細行を追加
  quote.items.forEach(item => {
    quoteData.push([
      item.productName,
      item.unitPrice.toString(),
      item.quantity.toString(),
      item.amount.toString()
    ])
  })
  
  // 合計行を追加
  quoteData.push(
    [],
    ['', '', '小計:', quote.subtotal.toString()],
    ['', '', '消費税:', quote.tax.toString()],
    ['', '', '合計:', quote.totalAmount.toString()]
  )
  
  // ワークシートを作成
  const worksheet = XLSX.utils.aoa_to_sheet(quoteData)
  
  // 列幅の設定
  worksheet['!cols'] = [
    { wch: 30 }, // 商品名
    { wch: 12 }, // 単価
    { wch: 8 },  // 数量
    { wch: 12 }, // 金額
  ]
  
  // ワークブックに追加
  XLSX.utils.book_append_sheet(workbook, worksheet, '見積書')
  
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

export function createAllQuotesExcelFile(quotes: Quote[]): Blob {
  // ワークブックを作成
  const workbook = XLSX.utils.book_new()
  
  // 見積一覧シート
  const summaryData = quotes.map(quote => ({
    見積ID: quote.id,
    顧客名: quote.customerName,
    作成日: format(new Date(quote.createdAt), 'yyyy/MM/dd'),
    明細数: quote.items.length,
    小計: quote.subtotal,
    消費税: quote.tax,
    合計金額: quote.totalAmount
  }))
  
  const summarySheet = XLSX.utils.json_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, '見積一覧')
  
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