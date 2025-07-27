# 🚀 Portfolio デプロイガイド

## 概要
このプロジェクトを **Vercel（フロントエンド）+ Railway（バックエンド）** で無料デプロイする手順です。

**Dockerは不要**です。各プラットフォームが自動でビルドしてくれます。

## 🏗️ アーキテクチャ
- **フロントエンド**: React (Vercel)
- **バックエンド**: Ruby on Rails (Railway) 
- **データベース**: PostgreSQL (Railway)

---

## 📋 事前準備

### 必要なアカウント
1. [GitHub](https://github.com) - リポジトリ管理
2. [Railway](https://railway.app) - バックエンド・DB
3. [Vercel](https://vercel.com) - フロントエンド

---

## 🛠️ 1. バックエンドデプロイ（Railway）

### 1.1 Railwayでプロジェクト作成
1. [Railway](https://railway.app)にログイン
2. 「New Project」→「Deploy from GitHub repo」
3. このリポジトリを選択
4. 「Deploy」をクリック

### 1.2 PostgreSQLデータベース追加
1. プロジェクトダッシュボードで「+ New」
2. 「Database」→「Add PostgreSQL」
3. データベースが自動作成される

### 1.3 環境変数設定
**Variables**タブで以下を設定：

```bash
# Rails設定
RAILS_ENV=production
SECRET_KEY_BASE=（32文字以上のランダム文字列）
RAILS_MASTER_KEY=（backend/Ruby/config/master.keyの内容）

# データベース接続情報（Railwayが自動設定）
DATABASE_URL=${{Postgres.DATABASE_URL}}
PGDATABASE=${{Postgres.PGDATABASE}}
PGHOST=${{Postgres.PGHOST}}
PGPASSWORD=${{Postgres.PGPASSWORD}}
PGPORT=${{Postgres.PGPORT}}
PGUSER=${{Postgres.PGUSER}}

# その他
PORT=3000
```

### 1.4 Root Directory設定
1. 「Settings」タブ
2. 「Root Directory」に `backend/Ruby` を設定
3. 「Save Config」

### 1.5 デプロイ完了を確認
- ビルドログでエラーがないか確認
- 生成されたURLにアクセスして動作確認

---

## 🎨 2. フロントエンドデプロイ（Vercel）

### 2.1 環境変数ファイル作成
`frontend/react/.env.production` を作成：

```bash
VITE_API_BASE=https://あなたのrailway-url.railway.app
```

※ Railway URLは前のステップで確認

### 2.2 Vercelでプロジェクト作成
1. [Vercel](https://vercel.com)にログイン
2. 「Add New...」→「Project」
3. GitHubリポジトリをインポート
4. **Root Directory**を `frontend/react` に設定
5. **Build Command**を `npm run build` に設定
6. **Output Directory**を `dist` に設定

### 2.3 環境変数設定
Project Settings → Environment Variables：

```bash
VITE_API_BASE=https://あなたのrailway-url.railway.app
```

### 2.4 デプロイ実行
「Deploy」ボタンでデプロイ開始

---

## 🔧 3. 最終設定

### 3.1 CORS設定確認
Rails側で以下が設定済みか確認：

`backend/Ruby/config/initializers/cors.rb`:
```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'https://あなたのvercel-url.vercel.app'
    resource '*', headers: :any, methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end
```

### 3.2 データベースマイグレーション
Railway コンソールで実行：
```bash
bundle exec rails db:migrate
bundle exec rails db:seed  # 初期データが必要な場合
```

---

## ✅ 4. デプロイ確認

### チェックリスト
- [ ] Railway バックエンドが起動している
- [ ] PostgreSQL データベースが接続されている  
- [ ] Vercel フロントエンドが表示される
- [ ] API通信が正常に動作する
- [ ] 画像アップロード等の機能が動作する

---

## 🎯 5. 完了！

**フロントエンド URL**: `https://あなたのプロジェクト名.vercel.app`  
**バックエンド URL**: `https://あなたのプロジェクト名.railway.app`

---

## 🔍 トラブルシューティング

### よくある問題

**1. CORS エラー**
- Railway URLをVercel環境変数に正しく設定
- Rails CORS設定でVercel URLを許可

**2. データベース接続エラー**  
- Railway環境変数が正しく設定されているか確認
- PostgreSQL サービスが起動しているか確認

**3. ビルドエラー**
- Root Directory設定を確認
- 依存関係が正しくインストールされているか確認

**4. 環境変数が反映されない**
- デプロイ後に環境変数を変更した場合は再デプロイが必要

---

## 📝 注意事項

- **無料プラン制限**: Railway 500時間/月、Vercel 100GB帯域幅/月
- **スリープ機能**: Railway は30分非アクティブでスリープ
- **カスタムドメイン**: 有料プランでのみ利用可能
- **永続ストレージ**: Railway無料プランでは制限あり

---

## 🤝 サポート

質問や問題がある場合は、GitHubのIssuesでお知らせください。

Happy Deploying! 🎉