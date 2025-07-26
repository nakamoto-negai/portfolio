Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Portfolio routes with nested slides
  resources :portfolios do
    resources :powerpoints do
      member do
        get :download
        get :slideshow
      end
    end
  end  # データベースを削除・再作成

  resources :slides
    resources :powerpoints do
      member do
        get :download
        get :slideshow  # PowerPointsControllerのslideshowアクション（必要に応じて）
      end
    end


  # Individual slide routes for edit/update/destroy
  resources :slides, only: [:edit, :update, :destroy]
  
  # API routes
  namespace :api do
    namespace :v1 do
      resources :portfolios do
        resources :slides
      end
    end
  end


  # Defines the root path route ("/")
  root "portfolios#index"
end
