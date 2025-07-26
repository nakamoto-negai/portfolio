Rails.application.routes.draw do
  # 認証
  post '/register', to: 'auth#register'
  post '/login', to: 'auth#login'
  post '/logout', to: 'auth#logout'
  get '/login_check', to: 'auth#login_check'

  # CRUD処理
  namespace :api do
    namespace :v1 do
      resources :portfolios, only: [:index, :show, :create, :update, :destroy]
    end
  end
end
