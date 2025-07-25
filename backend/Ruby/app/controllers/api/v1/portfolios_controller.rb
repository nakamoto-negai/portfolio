class Api::V1::PortfoliosController < ApplicationController
skip_before_action :verify_authenticity_token # ← この行を追加
  before_action :set_portfolio, only: [:show, :update, :destroy]

  # GET /api/v1/portfolios
  def index
    @portfolios = Portfolio.all
    render json: @portfolios
  end

  # GET /api/v1/portfolios/:id
  def show
    render json: @portfolio
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

  #共通の処理をまとめる
  def set_portfolio
    @portfolio = Portfolio.find(params[:id])
  end

  # Strong Parameters
  def portfolio_params
    params.require(:portfolio).permit(:title, :description, :user_id, :is_public)
  end
end