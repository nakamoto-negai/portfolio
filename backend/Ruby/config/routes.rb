Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :users, only: [:show, :update]
    end
  end
  # 認証
  post '/register', to: 'auth#register'
  post '/login', to: 'auth#login'
  post '/logout', to: 'auth#logout'
  get '/login_check', to: 'auth#login_check'

  # CRUD処理
  namespace :api do
    namespace :v1 do
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
  end
end
