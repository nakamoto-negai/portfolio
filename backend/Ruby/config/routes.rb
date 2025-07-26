Rails.application.routes.draw do
  namespace :api, defaults: { format: :json } do
    # 認証系
    post '/register', to: 'auth#register'
    post '/login', to: 'auth#login'
    post '/logout', to: 'auth#logout'
    get '/login_check', to: 'auth#login_check'

    # /conversations/:id にアクセス（idは相手ユーザー）
    resources :conversations, only: [:index] do
      resources :messages, only: %i[index create]
    end

    # ユーザー一覧
    resources :users, only: [:index]
    resources :users, only: [:show]

    resources :portfolios, only: [:index, :show, :create, :update, :destroy] do
      collection do
        # GET /api/v1/portfolios/published
        # 公開設定のポートフォリオの一覧を取得
        get :published
        # GET /api/v1/portfolios/my
        # 自分のポートフォリオ一覧を取得
        get :my
      end
      resources :slides, only: [:index, :create, :update, :destroy] do
        collection do
          # GET /api/v1/portfolios/:portfolio_id/slides/thumbnail
          # サムネイル用の最初のスライドを取得
          get :thumbnail
          # POST /api/v1/portfolios/:portfolio_id/slides/bulk_create
          # スライド一括作成
          post :bulk_create
          # PUT /api/v1/portfolios/:portfolio_id/slides/reorder
          # スライド順序変更
          put :reorder
        end
      end
    end
  end
  mount ActionCable.server => '/cable'
end
