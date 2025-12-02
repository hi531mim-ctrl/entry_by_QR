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

## ステップ2: DATABASE_URLの設定

Prismaは`DATABASE_URL`を使用するため、以下のいずれかを実行：

### オプションA: 環境変数を手動で設定

Vercelダッシュボードの「Settings」→「Environment Variables」で：

```
Name: DATABASE_URL
Value: [POSTGRES_PRISMA_URLの値をコピー]
Environment: Production, Preview, Development
```

### オプションB: Vercel CLIを使用

```bash
# ローカルに環境変数をプル
vercel env pull

# .env.localファイルが作成されます
# POSTGRES_PRISMA_URLの値をコピーしてDATABASE_URLとして設定

vercel env add DATABASE_URL
# プロンプトでPOSTGRES_PRISMA_URLの値を貼り付け
# Production, Preview, Developmentすべてに追加
```

## ステップ3: 管理者パスワードの設定

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

## ステップ4: データベースマイグレーション

### ローカルから実行

```bash
# 環境変数をプル
vercel env pull .env.local

# DATABASE_URLをPOSTGRES_PRISMA_URLの値に設定
# .env.localファイルを編集：
# DATABASE_URL="[POSTGRES_PRISMA_URLの値]"

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

## ステップ5: デプロイ

```bash
git add .
git commit -m "Setup for Vercel Postgres"
git push origin main
```

Vercelが自動的にデプロイを開始します。

## 環境変数の確認

デプロイ前に、以下の環境変数が設定されていることを確認：

- ✅ `DATABASE_URL` (POSTGRES_PRISMA_URLの値)
- ✅ `ADMIN_PASSWORD_HASH`
- ✅ `POSTGRES_PRISMA_URL` (自動設定)
- ✅ `POSTGRES_URL_NON_POOLING` (自動設定)

## トラブルシューティング

### ビルドエラー: "PrismaClientInitializationError"

**原因**: `DATABASE_URL`が設定されていない

**解決策**:
1. Vercelダッシュボードで環境変数を確認
2. `DATABASE_URL`を`POSTGRES_PRISMA_URL`の値に設定
3. 再デプロイ

### マイグレーションエラー

**原因**: データベーステーブルが作成されていない

**解決策**:
1. ローカルから`npx prisma migrate deploy`を実行
2. またはVercel PostgresクライアントでSQLを直接実行

### 接続エラー

**原因**: データベースURLが正しくない

**解決策**:
1. `POSTGRES_PRISMA_URL`の値を確認（pgbouncer=trueが含まれているはず）
2. `DATABASE_URL`がこの値と一致していることを確認

## ローカル開発

ローカルで開発する場合：

```bash
# .env.localファイルを作成
vercel env pull .env.local

# または手動で.envファイルを作成
cp .env.example .env

# DATABASE_URLをローカルのPostgreSQLに設定
DATABASE_URL="postgresql://user:password@localhost:5432/entry_qr"

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
