# イベント参加登録・入場管理システム

QRコードを使用したイベント参加登録と入場管理システムです。Next.js + PostgreSQL + Prismaで構築されています。

## 機能

### 参加者向け
- 参加者情報の登録（名前、メール、学年、備考）
- QRコード生成と印刷
- レスポンシブデザイン

### 管理者向け
- パスワード認証によるログイン（デフォルト: `admin2024`）
- QRコードスキャン（カメラまたは手動入力）
- 入場ログの表示とクリア
- 統計情報の表示（登録者数、入場者数、入場率）
- CSVエクスポート

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **データベース**: PostgreSQL
- **ORM**: Prisma
- **スタイリング**: Tailwind CSS
- **QRコード**: qrcode, jsQR
- **デプロイ**: Vercel

## クイックスタート

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

```bash
cp .env.example .env
```

`.env`を編集：

```env
# ローカルのPostgreSQL（両方とも同じ値でOK）
POSTGRES_PRISMA_URL="postgresql://user:password@localhost:5432/entry_qr"
POSTGRES_URL_NON_POOLING="postgresql://user:password@localhost:5432/entry_qr"

# 管理者パスワード（デフォルト: admin2024）
ADMIN_PASSWORD_HASH="$2a$10$XPLxwZSbbZ/EwT.7Os6ZY.msvFk5p6TRylweX0K6akjI5UYpzB0cO"
```

### 3. データベースのセットアップ

```bash
# Prisma Clientの生成
npx prisma generate

# マイグレーションの実行
npx prisma migrate dev --name init
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 にアクセス

## Vercelへのデプロイ

詳細は [VERCEL_SETUP.md](./VERCEL_SETUP.md) を参照してください。

### 簡単な手順

1. **Vercel Postgresを作成**
   - Vercelダッシュボード → Storage → Create Database → Postgres
   - 環境変数（`POSTGRES_PRISMA_URL`など）が自動設定されます

2. **管理者パスワードを設定**（Settings → Environment Variables）
   ```
   ADMIN_PASSWORD_HASH = $2a$10$XPLxwZSbbZ/EwT.7Os6ZY.msvFk5p6TRylweX0K6akjI5UYpzB0cO
   ```

3. **マイグレーション実行**
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

4. **デプロイ**
   ```bash
   git push origin main
   ```

## プロジェクト構造

```
entry_by_QR/
├── app/
│   ├── api/              # API Routes
│   │   ├── admin/        # 管理者用API
│   │   └── participants/ # 参加者用API
│   ├── admin/            # 管理者ダッシュボード
│   ├── page.tsx          # 参加者登録ページ
│   └── globals.css       # グローバルスタイル
├── components/
│   ├── admin/            # 管理者用コンポーネント
│   └── QRScanner.tsx     # QRスキャナー
├── lib/
│   └── prisma.ts         # Prismaクライアント
├── prisma/
│   └── schema.prisma     # データベーススキーマ
└── README.md
```

## データベーススキーマ

### Participant（参加者）
- `id`: UUID
- `participantId`: 一意の参加者ID（PARTICIPANT_xxxxx）
- `name`: 参加者名
- `email`: メールアドレス
- `grade`: 学年
- `notes`: 備考
- `registeredAt`: 登録日時
- `scanned`: 入場済みフラグ

### EntryLog（入場ログ）
- `id`: UUID
- `participantId`: 参加者ID
- `scanDateTime`: スキャン日時

## 使い方

### 参加者として
1. トップページにアクセス
2. 必要事項を入力して登録
3. QRコードを保存または印刷
4. イベント当日にQRコードを提示

### 管理者として
1. 「管理者ログイン」をクリック
2. パスワードを入力（デフォルト: `admin2024`）
3. 「入場スキャン」でQRコードをスキャン
4. 「入場ログ」で履歴を確認
5. 「統計」でデータを確認・エクスポート

## カスタマイズ

### 管理者パスワードの変更

```bash
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
```

生成されたハッシュを`.env`の`ADMIN_PASSWORD_HASH`に設定

### 学年の選択肢を変更

`app/page.tsx`の`<select>`要素を編集

### デザインのカスタマイズ

`app/globals.css`と`tailwind.config.ts`でカラーを変更

## トラブルシューティング

### カメラが起動しない
- HTTPSでアクセスしているか確認
- ブラウザのカメラ権限を確認

### データベース接続エラー（Vercel）
- Vercel Postgresが正しく作成されているか確認
- `POSTGRES_PRISMA_URL`環境変数が自動設定されているか確認
- Vercelダッシュボードの「Storage」→「Postgres」で確認

### データベース接続エラー（ローカル）
- `.env`の`POSTGRES_PRISMA_URL`が正しいか確認
- PostgreSQLサーバーが起動しているか確認

### ビルドエラー
```bash
rm -rf node_modules .next
npm install
npm run build
```

## ライセンス

MIT

## サポート

問題が発生した場合は、GitHubのIssuesで報告してください。
