# 開発履歴

## プロジェクト概要

Excel価格管理システムのWeb化プロジェクト。ExcelベースからWebベースへの価格管理システム移行を支援する。

## 開発経緯

### 初期要件（youken.md）
- Excelファイルのインポート/エクスポート機能
- 商品価格管理
- データフィルタリング
- レコードの統合機能
- 見積書作成機能

### 技術選定
- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS v3
- **Excelライブラリ**: SheetJS (xlsx)
- **ファイルアップロード**: react-dropzone
- **アイコン**: Lucide React
- **日付処理**: date-fns
- **認証**: Next.js Middleware (Basic Auth)

## 実装フェーズ

### フェーズ1: プロジェクト基盤構築
- Next.js 14プロジェクトの初期セットアップ
- TypeScript設定
- Tailwind CSS設定

### フェーズ2: 技術的問題の解決
#### ES Module エラー対応
- **問題**: `module is not defined in ES module scope`
- **解決**: package.jsonから`"type": "module"`を削除

#### Tailwind CSS v4 エラー対応
- **問題**: Tailwind CSS v4が@tailwindcss/postcssを要求
- **解決**: Tailwind CSS v3.4.17にダウングレード

### フェーズ3: コア機能実装
- **データ型定義** (`lib/types.ts`)
- **ストレージ管理** (`lib/storage.ts`) - localStorage抽象化
- **Excel処理** (`lib/excel-utils.ts`, `lib/quote-excel-utils.ts`)
- **テンプレート生成** (`lib/template-utils.ts`)

### フェーズ4: UI実装
#### ページ実装
- **ダッシュボード** (`app/page.tsx`) - 統計とクイックアクセス
- **インポート** (`app/import/page.tsx`) - Excel ドラッグ&ドロップ
- **商品管理** (`app/products/page.tsx`) - CRUD操作とフィルタリング
- **データ統合** (`app/merge/page.tsx`) - 重複検出と統合
- **見積作成** (`app/quotes/page.tsx`) - 見積書作成と管理
- **エクスポート** (`app/export/page.tsx`) - Excelダウンロード

#### コンポーネント実装
- **ヘッダー** (`components/Header.tsx`) - ナビゲーション

### フェーズ5: 機能追加・修正
#### 商品コピー機能追加
- **要求**: "商品管理のページで、商品のレコードをコピーして増やすボタンを追加してください。"
- **実装**: handleCopy関数とコピーボタンをproductsページに追加

#### ダッシュボード統計修正
- **問題**: "ダッシュボードに表示される商品件数や作成済みの見積もりの件数などが正しく表示されず、0件のままです。"
- **原因**: サーバーサイド生成時にlocalStorageにアクセス不可
- **解決**: dashboard を client component に変更、useEffect でデータ読み込み

### フェーズ6: ダークモード実装
#### 基盤構築
- **Tailwind設定**: `darkMode: 'class'` 設定
- **ThemeContext**: React Context でダークモード状態管理
- **ヘッダー**: モード切り替えボタン追加

#### 全ページ対応
1. **ダッシュボード**: 統計カード、リンクカード
2. **インポート**: ファイルドロップ、プレビューテーブル、ヘルプセクション
3. **商品管理**: 検索、フィルター、テーブル、編集フィールド
4. **見積作成**: フォーム、商品検索、明細テーブル
5. **データ統合**: 重複グループ、設定パネル、警告メッセージ
6. **エクスポート**: ダウンロードカード、見積一覧

#### 品質向上
- **不完全対応修正**: 見積作成とエクスポート画面の追加修正
- **包括的修正**: 商品管理と見積作成画面の完全ダークモード対応
  - 全UI要素（背景、テキスト、ボーダー、ボタン、入力フィールド、テーブル）を網羅的に対応

### フェーズ7: セキュリティ実装
#### ベーシック認証
- **middleware.ts**: Next.js Middleware による認証実装
- **環境変数**: BASIC_AUTH_USER, BASIC_AUTH_PASSWORD
- **Vercel対応**: エッジランタイムでの高速処理

## データ設計

### Product型
```typescript
interface Product {
  id: string
  name: string
  category: string
  basePrice: number
  discountRate?: number
  taxRate: number
  updatedAt: string
}
```

### Quote型
```typescript
interface Quote {
  id: string
  customerName: string
  items: QuoteItem[]
  subtotal: number
  tax: number
  totalAmount: number
  createdAt: string
}
```

### QuoteItem型
```typescript
interface QuoteItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discountRate?: number
  amount: number
}
```

## ストレージ設計

### LocalStorage キー
- `excel-web-demo-products`: 商品データ配列
- `excel-web-demo-quotes`: 見積データ配列

### ストレージ操作
- SSR安全性: `typeof window !== 'undefined'` チェック
- CRUD操作: Create, Read, Update, Delete の完全サポート

## ビジネスロジック

### 重複検出
- **基準**: 商品名 + カテゴリの組み合わせ（大文字小文字区別なし）
- **統合戦略**: 最初保持、最新保持（updatedAt基準）、最高価格保持

### 見積計算
- **単価**: `basePrice * (1 - discountRate/100)`
- **消費税**: 10%固定
- **合計**: 小計 + 消費税

### Excel統合
- **インポート**: 日本語・英語ヘッダー両対応
- **エクスポート**: 適切な列幅と日本語ヘッダー付きフォーマット
- **ファイル制限**: 10MB、.xlsx/.xls形式

## デプロイ・認証

### 開発環境
- `.env.local` で認証情報設定
- `npm run dev` で開発サーバー起動

### 本番環境（Vercel）
- 環境変数での認証情報管理
- 自動HTTPS化
- エッジランタイムでの高速認証

## 品質管理

### 解決した技術課題
1. **ES Module 競合**: package.json調整で解決
2. **Tailwind CSS バージョン問題**: v3へのダウングレードで解決
3. **SSR/CSR データ不整合**: Client Component化で解決
4. **ダークモード不完全対応**: 包括的な修正で解決

### パフォーマンス最適化
- **エッジランタイム**: Vercelエッジでの高速処理
- **軽量実装**: 最小限のコードで高速処理
- **SSR対応**: Server/Client適切な分離

## 将来の拡張可能性

### 認証
- 複数ユーザー対応
- ロールベースアクセス制御

### データ管理
- バックエンドデータベース統合
- リアルタイム同期

### 機能拡張
- 商品カテゴリ管理
- 見積テンプレート機能
- 売上分析機能

## 開発メモ

### コーディング方針
- **日本語優先**: ユーザー向けUIは日本語
- **TypeScript厳格**: 型安全性重視
- **コンポーネント分離**: 再利用可能な設計
- **レスポンシブ**: モバイル対応

### デバッグ記録
- localStorage デバッグ: Chrome DevTools Application タブ
- ダークモード確認: ブラウザの Dark mode 設定変更
- Excel処理確認: SheetJS utils での詳細ログ

---

**最終更新**: 2025年1月現在
**開発者**: Claude Code による実装支援
**ライセンス**: ISC