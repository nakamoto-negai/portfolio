# ベースイメージを指定
FROM ruby:3.2.2

#作業ディレクトリ
WORKDIR /var/www/html

#ローカルディレクトリをコンテナ内の/var...にコピー
COPY ./Ruby /var/www/html/

#gemのバンドラーをインストールし、バンドルをインストール
RUN gem install bundler && bundle install

RUN apt-get update && \
    apt-get install -y libreoffice && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN apt-get update && \
    apt-get install -y fonts-noto-cjk fonts-ipafont-gothic fonts-ipafont-mincho && \
    fc-cache -fv