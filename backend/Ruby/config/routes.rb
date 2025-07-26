Rails.application.routes.draw do
  # 認証
  namespace :api, defaults: { format: :json } do
    post '/register', to: 'auth#register'
    post '/login', to: 'auth#login'
    post '/logout', to: 'auth#logout'
    get '/login_check', to: 'auth#login_check'

    # /conversations/:id にアクセス（idは相手ユーザー）
    # ネストでメッセージ
    resources :conversations, only: [:index] do
      resources :messages, only: %i[index create]
    end
    # ユーザー一覧
    resources :users, only: [:index]
    resources :users, only: [:show]
  end

  mount ActionCable.server => '/cable'
end
