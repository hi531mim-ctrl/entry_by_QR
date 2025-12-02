# Vercel セットアップガイド

このガイドでは、Vercel Postgresを使用してアプリケーションをデプロイする手順を説明します。

## ステップ1: Vercel Postgresのセットアップ

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. プロジェクトを選択
3. 「Storage」タブ → 「Create Database」
4. 「Postgres」を選択して作成

Vercelは以下の環境変数を自動的に作成します：
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- など

## ステップ2: 管理者パスワードの設定

環境変数に以下を追加：

```
Name: ADMIN_PASSWORD_HASH
Value: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
Environment: Production, Preview, Development
```

デフォルトパスワード: `admin2024`

カスタムパスワードを使用する場合：

```bash
# Node.jsでハッシュを生成
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
```

## ステップ3: データベースマイグレーション

### ローカルから実行

```bash
# 環境変数をプル
vercel env pull .env.local

# .env.localファイルが作成され、POSTGRES_PRISMA_URLなどが自動的に設定されます

# マイグレーションを実行
npx prisma migrate deploy
```

### またはVercel Postgresクライアントを使用

Vercelダッシュボードの「Storage」→「Postgres」→「Query」タブで、以下のSQLを実行：

```sql
-- Participantテーブルの作成
CREATE TABLE "Participant" (
  "id" TEXT NOT NULL,
  "participantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "grade" TEXT NOT NULL,
  "notes" TEXT,
  "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "scanned" BOOLEAN NOT NULL DEFAULT false,

  CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- EntryLogテーブルの作成
CREATE TABLE "EntryLog" (
  "id" TEXT NOT NULL,
  "participantId" TEXT NOT NULL,
  "scanDateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "EntryLog_pkey" PRIMARY KEY ("id")
);

-- インデックスの作成
CREATE UNIQUE INDEX "Participant_participantId_key" ON "Participant"("participantId");
CREATE INDEX "Participant_participantId_idx" ON "Participant"("participantId");
CREATE INDEX "Participant_email_idx" ON "Participant"("email");
CREATE INDEX "EntryLog_participantId_idx" ON "EntryLog"("participantId");
CREATE INDEX "EntryLog_scanDateTime_idx" ON "EntryLog"("scanDateTime");

-- 外部キー制約の追加
ALTER TABLE "EntryLog" ADD CONSTRAINT "EntryLog_participantId_fkey"
  FOREIGN KEY ("participantId") REFERENCES "Participant"("participantId")
  ON DELETE RESTRICT ON UPDATE CASCADE;
```

## ステップ4: デプロイ

```bash
git add .
git commit -m "Setup for Vercel Postgres"
git push origin main
```

Vercelが自動的にデプロイを開始します。

## 環境変数の確認

デプロイ前に、以下の環境変数が設定されていることを確認：

- ✅ `POSTGRES_PRISMA_URL` (Vercel Postgresが自動設定)
- ✅ `POSTGRES_URL_NON_POOLING` (Vercel Postgresが自動設定)
- ✅ `ADMIN_PASSWORD_HASH` (手動で設定)

## トラブルシューティング

### ビルドエラー: "PrismaClientInitializationError"

**原因**: Vercel Postgresが正しく作成されていない、または環境変数が設定されていない

**解決策**:
1. Vercelダッシュボードの「Storage」→「Postgres」を確認
2. データベースが作成されているか確認
3. プロジェクトにリンクされているか確認
4. 環境変数`POSTGRES_PRISMA_URL`と`POSTGRES_URL_NON_POOLING`が自動設定されているか確認
5. 再デプロイ

### マイグレーションエラー

**原因**: データベーステーブルが作成されていない

**解決策**:
1. ローカルから`npx prisma migrate deploy`を実行
2. またはVercel PostgresクライアントでSQLを直接実行

### 接続エラー

**原因**: データベースURLが正しくない、またはデータベースが作成されていない

**解決策**:
1. Vercel Postgresが正しく作成されているか確認
2. `POSTGRES_PRISMA_URL`の値を確認（pgbouncer=trueが含まれているはず）
3. プロジェクトとデータベースが正しくリンクされているか確認

## ローカル開発

ローカルで開発する場合：

```bash
# .env.localファイルを作成
vercel env pull .env.local

# または手動で.envファイルを作成
cp .env.example .env

# POSTGRES_PRISMA_URLをローカルのPostgreSQLに設定
POSTGRES_PRISMA_URL="postgresql://user:password@localhost:5432/entry_qr"
POSTGRES_URL_NON_POOLING="postgresql://user:password@localhost:5432/entry_qr"

# マイグレーション
npx prisma migrate dev

# 開発サーバー起動
npm run dev
```

## 本番環境の確認

デプロイ後、以下を確認：

1. ✅ 参加者登録が動作する
2. ✅ QRコードが生成される
3. ✅ 管理者ログインができる
4. ✅ QRスキャンが動作する
5. ✅ 統計が表示される
6. ✅ CSVエクスポートが動作する

## 次のステップ

- カスタムドメインの設定
- 管理者パスワードの変更
- データのバックアップ設定
- モニタリングの確認
