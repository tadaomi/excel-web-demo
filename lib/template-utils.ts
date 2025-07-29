import * as XLSX from 'xlsx'

export function createExcelTemplate(): Blob {
  // テンプレートデータ
  const templateData = [
    // ヘッダー行
    ['商品名', 'カテゴリ', '基本価格', '割引率', '税率'],
    // サンプルデータ
    ['ボールペン（黒）', '文具', 150, 10, 0.1],
    ['ボールペン（赤）', '文具', 150, 10, 0.1],
    ['ノート A4', '文具', 300, 5, 0.1],
    ['クリアファイル', '文具', 100, 15, 0.1],
    ['ホッチキス', '文具', 800, '', 0.1],
    ['デスクライト LED', '家電', 3500, 20, 0.1],
    ['USBメモリ 32GB', 'IT機器', 1200, 25, 0.1],
    ['マウス ワイヤレス', 'IT機器', 2000, 15, 0.1],
    ['キーボード', 'IT機器', 4500, 10, 0.1],
    ['モニター 24インチ', 'IT機器', 25000, 30, 0.1],
    // 空行（ユーザーが追加入力用）
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
  ]
  
  // ワークシートを作成
  const worksheet = XLSX.utils.aoa_to_sheet(templateData)
  
  // 列幅の設定
  worksheet['!cols'] = [
    { wch: 25 }, // 商品名
    { wch: 15 }, // カテゴリ
    { wch: 12 }, // 基本価格
    { wch: 10 }, // 割引率
    { wch: 8 },  // 税率
  ]
  
  // ヘッダー行のスタイル設定（背景色）
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:E1')
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col })
    if (!worksheet[cellRef]) continue
    worksheet[cellRef].s = {
      fill: { fgColor: { rgb: 'E3F2FD' } },
      font: { bold: true }
    }
  }
  
  // ワークブックを作成
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '商品データテンプレート')
  
  // バイナリデータに変換
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' })
  
  // Blobに変換
  const buf = new ArrayBuffer(wbout.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i < wbout.length; i++) {
    view[i] = wbout.charCodeAt(i) & 0xFF
  }
  
  return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

// テンプレートファイルをダウンロードする関数
export function downloadTemplate() {
  const blob = createExcelTemplate()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = '商品データテンプレート.xlsx'
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}