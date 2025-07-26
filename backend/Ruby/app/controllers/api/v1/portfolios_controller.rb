class Api::V1::PortfoliosController < ApplicationController
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
      only: [:id, :title, :description, :created_at, :updated_at],
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
    
    @portfolios = current_user.portfolios.includes(:slides).recent
    render json: @portfolios.as_json(
      only: [:id, :title, :description, :is_public, :created_at, :updated_at],
      methods: [:slides_count]
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
    @portfolio = Portfolio.new(portfolio_params)
    if @portfolio.save
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