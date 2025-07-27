module Api
  class Api::PortfoliosController < ApplicationController
  skip_before_action :verify_authenticity_token 
    before_action :set_portfolio, only: [:show, :update, :destroy]

    # GET /api/v1/portfolios
    # 全ポートフォリオ取得
    def index
      @portfolios = Portfolio.all
      render json: @portfolios
    end

    # GET /api/v1/portfolios/published
    # 公開ポートフォリオ一覧取得
    def published
      @portfolios = Portfolio.published.includes(:user).recent
      render json: @portfolios.as_json(
        only: [:id, :title, :description, :created_at, :updated_at, :user_id],
        methods: [
          :slides_count, 
          :powerpoints_count, 
          :total_powerpoint_size, 
          :latest_powerpoint_filename,
          :likes_count,
          :has_main_image?,
          :main_image_url
        ],
        include: { user: { only: [:id, :name] } }
      )
    end

    # GET /api/v1/portfolios/my
    # 自分のポートフォリオ一覧取得
    def my
      unless current_user
        render json: { error: 'ログインが必要です' }, status: :unauthorized
        return
      end
      
      @portfolios = current_user.portfolios.includes(:slides, :powerpoints).recent
      render json: @portfolios.as_json(
        only: [:id, :title, :description, :is_public, :created_at, :updated_at],
        methods: [
          :slides_count, 
          :powerpoints_count, 
          :total_powerpoint_size, 
          :latest_powerpoint_filename,
          :likes_count,
          :has_main_image?,
          :main_image_url
        ]
      )
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
      unless current_user
        render json: { error: 'ログインが必要です' }, status: :unauthorized
        return
      end
      
      @portfolio = Portfolio.new(portfolio_params)
      @portfolio.user = current_user
      
      # PowerPointファイルを一時的に保存
      @portfolio.powerpoint_files = params[:portfolio][:powerpoint_files] if params[:portfolio][:powerpoint_files]
      
      if @portfolio.save
        if params[:portfolio][:powerpoint_files]
          # 1つ目のファイルをPowerPointモデルとして保存
          powerpoint = @portfolio.powerpoints.create(file: params[:portfolio][:powerpoint_files].first)
          PowerpointImageExtractorService.new(@portfolio, powerpoint).extract_main_image
          PowerpointImageExtractorService.new(@portfolio, powerpoint).extract_all_slide_images
        end
        render json: @portfolio, status: :created
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