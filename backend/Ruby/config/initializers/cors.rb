Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # ReactアプリケーションのURLを指定
    origins 'http://localhost:5173'
    # 全てのリソースに対してCORSを許可
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options], # PUTとPATCHを追加
      credentials: true
  end
end