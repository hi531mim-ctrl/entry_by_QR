# デプロイガイド

このガイドでは、イベント参加登録・入場管理システムをVercelにデプロイする方法を説明します。

## 前提条件

- GitHubアカウント
- Vercelアカウント
- Gitリポジトリ（GitHubにプッシュ済み）

## ステップ1: GitHubリポジトリの準備

### リポジトリの作成

```bash
# Gitリポジトリの初期化（まだの場合）
git init

# .gitignoreの確認
# .env ファイルがgitignoreに含まれていることを確認

# コミット
git add .
git commit -m "Initial commit"

# GitHubリポジトリにプッシュ
git remote add origin https://github.com/your-username/entry-by-qr.git
git branch -M main
git push -u origin main
```

## ステップ2: Vercelプロジェクトの作成

### 2.1 Vercelダッシュボードでプロジェクトをインポート

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリを選択
4. プロジェクト名を入力（例: `entry-by-qr`）

### 2.2 ビルド設定

以下の設定を確認：

- **Framework Preset**: Next.js
- **Build Command**: `prisma generate && next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## ステップ3: Vercel Postgresのセットアップ

### 3.1 データベースの作成

1. Vercelダッシュボードでプロジェクトを選択
2. 「Storage」タブをクリック
3. 「Create Database」をクリック
4. 「Postgres」を選択
5. データベース名を入力（例: `entry-qr-db`）
6. リージョンを選択（最も近い地域を推奨）
7. 「Create」をクリック

### 3.2 環境変数の自動設定

Vercel Postgresを作成すると、以下の環境変数が自動的に設定されます：

- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- など

Prismaは`POSTGRES_PRISMA_URL`を使用します。

## ステップ4: 追加の環境変数設定

### 4.1 管理者パスワードハッシュの設定

1. Vercelダッシュボードの「Settings」→「Environment Variables」
2. 以下の環境変数を追加：

```
Name: ADMIN_PASSWORD_HASH
Value: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
Environment: Production, Preview, Development
```

デフォルトのパスワードは `admin2024` です。

### 4.2 カスタムパスワードの作成（オプション）

ローカルでパスワードハッシュを生成：

```bash
# Node.js REPLで実行
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
```

生成されたハッシュを`ADMIN_PASSWORD_HASH`に設定します。

### 4.3 Next Auth Secretの設定

```bash
# ランダムな秘密鍵を生成
openssl rand -base64 32
```

生成された文字列を環境変数に追加：

```
Name: NEXTAUTH_SECRET
Value: [生成された文字列]
Environment: Production, Preview, Development
```

## ステップ5: データベースマイグレーション

### 5.1 ローカル環境でマイグレーション

```bash
# Vercelの環境変数をローカルにプル
vercel env pull .env.local

# マイグレーションの実行
npx prisma migrate deploy
```

### 5.2 または、Vercel Postgresクライアントを使用

```bash
# Vercel Postgres CLIをインストール
npm i -g vercel

# Vercelにログイン
vercel login

# 環境変数をプル
vercel env pull

# マイグレーションを実行
npx prisma migrate deploy
```

## ステップ6: デプロイ

### 6.1 自動デプロイ

GitHubにプッシュすると自動的にデプロイされます：

```bash
git add .
git commit -m "Configure for production"
git push origin main
```

### 6.2 手動デプロイ（オプション）

```bash
# Vercel CLIでデプロイ
vercel --prod
```

## ステップ7: デプロイ後の確認

### 7.1 デプロイの確認

1. Vercelダッシュボードで「Deployments」タブを確認
2. 最新のデプロイが「Ready」になっていることを確認
3. プロダクションURLにアクセス（例: `https://entry-by-qr.vercel.app`）

### 7.2 機能のテスト

1. **参加者登録**
   - トップページで登録フォームを入力
   - QRコードが生成されることを確認

2. **管理者ログイン**
   - 「管理者ログイン」をクリック
   - パスワード（`admin2024`）でログイン

3. **QRスキャン**
   - 「入場スキャン」タブで手動入力をテスト
   - カメラスキャンをテスト（HTTPSが必要）

4. **統計とエクスポート**
   - 「統計」タブで数値を確認
   - CSVエクスポート機能をテスト

## トラブルシューティング

### ビルドエラー

**エラー**: `Prisma Client not found`

**解決策**:
```bash
# package.jsonのスクリプトを確認
"build": "prisma generate && next build"
```

### データベース接続エラー

**エラー**: `Can't reach database server`

**解決策**:
1. Vercel Postgresが正しく作成されているか確認
2. 環境変数`POSTGRES_PRISMA_URL`が設定されているか確認
3. `prisma/schema.prisma`の`datasource db`セクションを確認：

```prisma
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
}
```

### カメラが動作しない

**原因**: HTTPSが必要

**解決策**:
- Vercelは自動的にHTTPSを提供します
- カスタムドメインを使用する場合、SSL証明書が設定されていることを確認

### 環境変数が反映されない

**解決策**:
1. Vercelダッシュボードで環境変数を確認
2. 「Redeploy」をクリックして再デプロイ
3. キャッシュをクリアして再ビルド

## カスタムドメインの設定

### 1. ドメインの追加

1. Vercelダッシュボードの「Settings」→「Domains」
2. カスタムドメインを入力（例: `event.yourdomain.com`）
3. DNSレコードを設定（Vercelが指示を表示）

### 2. DNSレコードの例

```
Type: CNAME
Name: event
Value: cname.vercel-dns.com
```

### 3. SSL証明書

Vercelが自動的にSSL証明書を発行します（Let's Encrypt）。

## パフォーマンスの最適化

### 1. データベース接続プーリング

Vercel Postgresはデフォルトで接続プーリングを有効にしています。

### 2. キャッシング

Next.js 14のApp Routerはデフォルトでキャッシングを行います。

### 3. 画像最適化

QRコードはData URLとして生成されるため、追加の最適化は不要です。

## バックアップ

### データベースのバックアップ

```bash
# Vercel Postgresからエクスポート
vercel postgres export entry-qr-db

# または、pg_dumpを使用
pg_dump $POSTGRES_URL > backup.sql
```

### データの復元

```bash
# pg_restoreを使用
psql $POSTGRES_URL < backup.sql
```

## スケーリング

Vercelは自動的にスケーリングします：

- **Hobby Plan**: 月100GB帯域幅
- **Pro Plan**: 月1TB帯域幅
- **Enterprise**: カスタム

データベースのスケーリングはVercel Postgresのプランに依存します。

## セキュリティ

### 1. 環境変数の保護

- `.env`ファイルをGitにコミットしない
- Vercelダッシュボードで環境変数を管理
- 定期的にパスワードを変更

### 2. HTTPS

- Vercelは自動的にHTTPSを強制
- カスタムドメインでもHTTPSを使用

### 3. データベースアクセス

- Vercel Postgresは自動的にセキュアな接続を使用
- 接続文字列は環境変数で管理

## モニタリング

### 1. Vercel Analytics

Vercelダッシュボードで以下を確認：
- リクエスト数
- エラー率
- レスポンスタイム

### 2. Prisma Studio

データベースの内容を確認：

```bash
# ローカルから接続
vercel env pull
npx prisma studio
```

## サポート

問題が発生した場合：

1. [Vercel Documentation](https://vercel.com/docs)
2. [Prisma Documentation](https://www.prisma.io/docs)
3. [Next.js Documentation](https://nextjs.org/docs)
4. GitHubのIssues

## まとめ

このガイドに従って、イベント参加登録・入場管理システムをVercelに正常にデプロイできました。

重要なポイント：
- ✅ Vercel Postgresのセットアップ
- ✅ 環境変数の設定
- ✅ データベースマイグレーション
- ✅ 自動デプロイの設定
- ✅ HTTPSの有効化

次のステップ：
1. カスタムドメインの設定
2. 管理者パスワードの変更
3. データのバックアップ設定
4. モニタリングの確認
