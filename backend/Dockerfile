# コンテナのベースとなるイメージをインストールする
FROM ruby:3.1.2

# 必要なパッケージをインストールする
RUN apt-get update -qq && apt-get install -y vim postgresql-client

# コンテナで作業するディレクトリを指定する（ディレクトリがなければ作成する）
WORKDIR /myapp

# ローカルのGemfileとGemfile.lock（左）をコンテナのディレクトリ（右）にコピーする
COPY Gemfile /myapp/Gemfile
COPY Gemfile.lock /myapp/Gemfile.lock

# Gemの依存関係をインストールする（= Railsのgemをインストールする）
RUN bundle install

# ローカルのカレントディレクトリをコンテナのappディレクトリに保存する（=Railsアプリをコンテナにコピーする）
COPY . /myapp

# entrypoint.shをコンテナにコピーする
COPY entrypoint.sh /usr/bin/

# entrypoint.shを実行する
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]