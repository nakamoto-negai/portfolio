環境の構成  
portfolio  
｜  
｜ー backend    <- ruby on rails  
｜  ｜  
｜  ｜ーdocker  
｜     ｜  
｜     ｜ー Dockerfile  
｜  
｜ー frontend   <- React  
｜  ｜  
｜  ｜ーdocker  
｜     ｜  
｜     ｜ー Dockerfile  
｜  
｜ーdocker-compose.yml  <- 環境設定ファイル  


環境構築のセットアップ手順
①ローカルで React プロジェクトを作成
cd frontend
npm create vite@latest react -- --template react
cd react
npm install

これでローカルにReactプロジェクトが作成される。


②Ruby on railsに必要なファイルを作成
backendディレクト下にRubyディレクトリを作成
Rubyディレクトリ下にGemfileとGemfile.lockを作成

backend 
｜  ...
｜ーRuby
   ｜ーGemfile
   ｜ーGemfile.lock <-中身は空でいい

以下Gemfileの中身
source "https://rubygems.org"
ruby "3.2.2"
gem 'rails', '~> 7.1.3'


③コンテナの依存関係のビルドを行う。
portfolioディレクトリで以下のコマンドを実行。
docker-compose build --no-cache


④Ruby on railsのアプリケーションを作成
docker-compose run --rm backend rails new . --force --database=postgresql

これでローカルにRailsプロジェクトが作成される。


⑤Railsのデータベース設定。
Ruby/config/database.yml に以下の変更を行う。
development下で#でコメントアウトしてあるものも、コメントアウトを外して変数を以下の値に変更 .

adapter: postgresql
encoding: unicode
database: rails_db
host: db
username: root
password: passw@rd


⑥設定を反映させるためにもう一度ビルドする。。
portfolioディレクトリで以下のコマンドを実行。
docker-compose build --no-cache


⑦コンテナを立ち上げる
portfolioディレクトリで以下のコマンドを実行。
docker-compose up -d
これでコンテナが立ち上がる。

http://localhost:5173  (Reactのページ)
http://localhost:3000  (Ruby on Railsのページ)

コンテナを停止したいときは
docker-compose down
