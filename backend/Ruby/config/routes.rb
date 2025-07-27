Rails.application.routes.draw do
  # API routes
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

    # ユーザー一覧・詳細
    resources :users, only: [:index, :show, :update]

    # Portfolio API routes with enhanced features
    resources :portfolios, only: [:index, :show, :create, :update, :destroy] do
      collection do
        # GET /api/portfolios/published
        # 公開設定のポートフォリオの一覧を取得
        get :published
        # GET /api/portfolios/my
        # 自分のポートフォリオ一覧を取得
        get :my
      end
      resources :slides, only: [:index, :create, :update, :destroy] do
        collection do
          # GET /api/portfolios/:portfolio_id/slides/thumbnail
          # サムネイル用の最初のスライドを取得
          get :thumbnail
          # POST /api/portfolios/:portfolio_id/slides/bulk_create
          # スライド一括作成
          post :bulk_create
          # PUT /api/portfolios/:portfolio_id/slides/reorder
          # スライド順序変更
          put :reorder
        end
      end
      # いいね機能
      resource :likes, only: [:create, :destroy] do
        collection do
          get :status
        end
      end
    end

    # API v1 namespace for legacy support
    namespace :v1 do
      resources :portfolios do
        resources :slides
      end
    end
  end

  # Web interface routes (Non-API)
  resources :portfolios do
    resources :slides
    resources :powerpoints do
      member do
        get :download
        get :preview
      end
    end
    # スライドショー機能を追加
    member do
      get :slideshow
      post :extract_main_image
    end
  end

  # Individual slide routes for edit/update/destroy
  resources :slides, only: [:edit, :update, :destroy]

  # WebSocket
  mount ActionCable.server => '/cable'

  # Root path
  root "portfolios#index"
end
