# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## 開発コマンド

```bash
# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# 本番サーバーの起動
npm start

# リント
npm run lint
```

## アーキテクチャ概要

ExcelベースからWebベースの価格管理システムへの移行を支援する、Next.js 15 (App Router) で構築されたExcel価格管理システムです。

### セキュリティ

- **ベーシック認証**: Next.js Middleware (`middleware.ts`) を使用してアプリケーション全体を保護
- **環境変数管理**: 認証情報は`BASIC_AUTH_USER`と`BASIC_AUTH_PASSWORD`環境変数で管理
- **Vercel対応**: エッジランタイムでの高速認証処理

### コアデータフロー

1. **インポート**: ExcelファイルがSheetJSで解析 → Productオブジェクトに変換 → localStorageに保存
2. **管理**: 商品がテーブルでフィルタ・検索と共に表示 → インライン編集可能 → 更新内容がlocalStorageに保存
3. **見積作成**: 商品を選択 → 数量付きの見積項目に追加 → 税込み合計を計算
4. **エクスポート**: データをSheetJSでExcel形式に変換 → .xlsxファイルとしてダウンロード

### 主要コンポーネント構造

- **ページ** (`app/`): Next.js 14 App Routerページ

  - `/` - 統計とクイックアクセスのダッシュボード
  - `/import` - ドラッグ&ドロップでのExcelファイルアップロード
  - `/products` - インライン編集機能付き商品管理
  - `/merge` - 重複検出とデータ統合
  - `/quotes` - 見積作成と管理
  - `/export` - Excelファイルダウンロード

- **データレイヤー** (`lib/`):

  - `types.ts` - コアTypeScriptインターフェース (Product, Quote, QuoteItem)
  - `storage.ts` - 全CRUD操作のlocalStorage抽象化
  - `excel-utils.ts` - 商品のExcel解析・生成
  - `quote-excel-utils.ts` - 見積のExcel生成

- **UIコンポーネント** (`components/`):

  - `Header.tsx` - アクティブルートハイライト付きメインナビゲーション

### データストレージ戦略

すべてのデータは以下のキーでブラウザのlocalStorageに保存されます:

- `excel-web-demo-products` - 商品配列
- `excel-web-demo-quotes` - 見積配列

storageモジュールは `typeof window !== 'undefined'` をチェックしてSSRの安全性を確保しています。

### Excel統合

- **インポート**: 日本語と英語の列ヘッダーの両方をサポート (商品名/name, カテゴリ/category, など)
- **エクスポート**: 適切な列幅と日本語ヘッダー付きのフォーマットされたExcelファイルを生成
- **ファイル処理**: .xlsx/.xlsバリデーション付きファイルアップロードにreact-dropzoneを使用

### ビジネスロジック

- **重複検出**: 商品名 + カテゴリが一致する場合に重複と判定 (大文字小文字を区別しない)
- **見積計算**: unitPrice = basePrice * (1 - discountRate/100), 税率は10%固定
- **統合戦略**: 最初を保持、最新を保持 (updatedAtによる)、または最高価格を保持

## サンプルデータ

テスト用に `sample-data.md` を使用 - 様々な価格帯と割引率の3カテゴリ (文具, 家電, IT機器) にわたる15の商品サンプルが含まれています。
