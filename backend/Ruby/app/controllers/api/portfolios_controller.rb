module Api
  class Api::PortfoliosController < ApplicationController
  skip_before_action :verify_authenticity_token 
    before_action :set_portfolio, only: [:show, :update, :destroy, :like, :unlike]
    before_action :authenticate_user!, only: [:my, :create, :update, :destroy, :like, :unlike]

    # GET /api/v1/portfolios
    # 全ポートフォリオ取得
    def index
      @portfolios = Portfolio.all
      render json: @portfolios
    end

    # GET /api/v1/portfolios/published
    # 公開ポートフォリオ一覧取得
    def published
      begin
        @portfolios = Portfolio.published.includes(:user, :slides, :likes).recent
        
        portfolios_data = @portfolios.map do |portfolio|
          begin
            portfolio_hash = {
              id: portfolio.id,
              title: portfolio.title,
              description: portfolio.description,
              created_at: portfolio.created_at,
              updated_at: portfolio.updated_at,
              user_id: portfolio.user_id,
              user: portfolio.user ? { id: portfolio.user.id, name: portfolio.user.name, email: portfolio.user.email } : nil,
              slides_count: portfolio.slides_count,
              likes_count: portfolio.likes_count
            }
            
            # 画像URLは安全に取得
            portfolio_hash[:main_image_url] = portfolio.main_image_url
            portfolio_hash[:thumbnail_image_url] = portfolio.thumbnail_image_url
            
            portfolio_hash
          rescue => portfolio_error
            Rails.logger.error "Error processing published portfolio #{portfolio.id}: #{portfolio_error.message}"
            
            # エラーが発生したポートフォリオは基本情報のみ返す
            {
              id: portfolio.id,
              title: portfolio.title,
              description: portfolio.description,
              created_at: portfolio.created_at,
              updated_at: portfolio.updated_at,
              user_id: portfolio.user_id,
              user: portfolio.user ? { id: portfolio.user.id, name: portfolio.user.name } : nil,
              slides_count: 0,
              likes_count: 0,
              main_image_url: nil,
              thumbnail_image_url: nil
            }
          end
        end
        
        render json: portfolios_data
      rescue => e
        Rails.logger.error "Error in published portfolios: #{e.message}"
        Rails.logger.error "Backtrace: #{e.backtrace.join("\n")}"
        render json: { error: 'サーバーエラーが発生しました' }, status: :internal_server_error
      end
    end

    # GET /api/v1/portfolios/my
    # 自分のポートフォリオ一覧取得
    def my
      Rails.logger.info "My portfolios request - session: #{session.inspect}"
      Rails.logger.info "Current user: #{current_user.inspect}"
      
      begin
        @portfolios = current_user.portfolios.includes(:slides, :likes).recent
        Rails.logger.info "Found #{@portfolios.count} portfolios for user #{current_user.id}"
        
        # 各ポートフォリオのメソッドをテストしてエラーの原因を特定
        portfolios_data = @portfolios.map do |portfolio|
          begin
            portfolio_hash = {
              id: portfolio.id,
              title: portfolio.title,
              description: portfolio.description,
              is_public: portfolio.is_public,
              created_at: portfolio.created_at,
              updated_at: portfolio.updated_at,
              slides_count: portfolio.slides_count,
              likes_count: portfolio.likes_count
            }
            
            # 画像URLは安全に取得
            portfolio_hash[:main_image_url] = portfolio.main_image_url
            portfolio_hash[:thumbnail_image_url] = portfolio.thumbnail_image_url
            
            Rails.logger.info "Successfully processed portfolio #{portfolio.id}"
            portfolio_hash
          rescue => portfolio_error
            Rails.logger.error "Error processing portfolio #{portfolio.id}: #{portfolio_error.message}"
            Rails.logger.error "Portfolio error backtrace: #{portfolio_error.backtrace.first(5).join("\n")}"
            
            # エラーが発生したポートフォリオは基本情報のみ返す
            {
              id: portfolio.id,
              title: portfolio.title,
              description: portfolio.description,
              is_public: portfolio.is_public,
              created_at: portfolio.created_at,
              updated_at: portfolio.updated_at,
              slides_count: 0,
              likes_count: 0,
              main_image_url: nil,
              thumbnail_image_url: nil
            }
          end
        end
        
        render json: portfolios_data
      rescue => e
        Rails.logger.error "Error in my portfolios: #{e.message}"
        Rails.logger.error "Backtrace: #{e.backtrace.join("\n")}"
        render json: { error: 'サーバーエラーが発生しました' }, status: :internal_server_error
      end
    end

    # GET /api/v1/portfolios/:id
    # ポートフォリオ詳細取得
    def show
      render json: @portfolio.as_json(
        only: [:id, :title, :description, :is_public, :created_at, :updated_at],
        include: { user: { only: [:id, :name] } }
      )
    end

    # POST /api/v1/portfolios
    def create
      @portfolio = Portfolio.new(portfolio_params)
      @portfolio.user = current_user if current_user
      
      # PPTXファイルが送信されている場合の処理
      if params[:powerpoint_files].present?
        @portfolio.powerpoint_files = params[:powerpoint_files]
      end
      
      if @portfolio.save
        render json: @portfolio.as_json(
          only: [:id, :title, :description, :is_public, :created_at, :updated_at],
          methods: [:slides_count]
        ), status: :created
      else
        render json: @portfolio.errors, status: :unprocessable_entity
      end
    end

    # PATCH/PUT /api/v1/portfolios/:id
    def update
      if @portfolio.update(portfolio_params)
        render json: @portfolio
      else
        render json: @portfolio.errors, status: :unprocessable_entity
      end
    end

    # DELETE /api/v1/portfolios/:id
    def destroy
      @portfolio.destroy
      render json: { message: 'Portfolio deleted successfully' }, status: :ok
    end

    # POST /api/portfolios/:id/like
    def like
      existing_like = @portfolio.likes.find_by(user: current_user)
      if existing_like
        render json: { message: '既にいいね済みです', likes_count: @portfolio.likes.count }, status: :ok
      else
        @portfolio.likes.create(user: current_user)
        render json: { message: 'いいねしました', likes_count: @portfolio.likes.count }, status: :created
      end
    end

    # DELETE /api/portfolios/:id/unlike
    def unlike
      like = @portfolio.likes.find_by(user: current_user)
      if like
        like.destroy
        render json: { message: 'いいねを取り消しました', likes_count: @portfolio.likes.count }, status: :ok
      else
        render json: { message: 'いいねしていません', likes_count: @portfolio.likes.count }, status: :ok
      end
    end

    private

    # ポートフォリオ取得
    def set_portfolio
      @portfolio = Portfolio.includes(:user).find(params[:id])
    end

    # Strong Parameters
    def portfolio_params
      params.require(:portfolio).permit(:title, :description, :user_id, :is_public)
    end
  end
end