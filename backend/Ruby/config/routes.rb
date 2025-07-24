Rails.application.routes.draw do
  # 認証
  post '/register', to: 'auth#register'
  post '/login', to: 'auth#login'
  post '/logout', to: 'auth#logout'
  get '/login_check', to: 'auth#login_check'
end
