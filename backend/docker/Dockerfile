# ベースイメージを指定
FROM ruby:3.2.2

#作業ディレクトリ
WORKDIR /var/www/html

#ローカルディレクトリをコンテナ内の/var...にコピー
COPY ./Ruby /var/www/html/

#gemのバンドラーをインストールし、バンドルをインストール
RUN gem install bundler && bundle install