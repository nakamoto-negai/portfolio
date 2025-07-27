# ベースイメージを指定
FROM ruby:3.2.2

#作業ディレクトリ
WORKDIR /var/www/html

#ローカルディレクトリをコンテナ内の/var...にコピー
COPY ./Ruby /var/www/html/

#gemのバンドラーをインストールし、バンドルをインストール
RUN gem install bundler && bundle install

RUN apt-get update --fix-missing && \
    apt-get install -y --no-install-recommends libreoffice fonts-noto-cjk fonts-ipafont-gothic fonts-ipafont-mincho imagemagick ghostscript && \
    fc-cache -fv && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    sed -i 's/^.*policy.*coder.*none.*PDF.*//' /etc/ImageMagick-6/policy.xml && \
    sed -i 's/^.*policy.*coder.*none.*PS.*//' /etc/ImageMagick-6/policy.xml