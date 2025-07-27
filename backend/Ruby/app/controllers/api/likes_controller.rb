class Api::LikesController < Api::ApplicationController
  before_action :authenticate_user!
  before_action :set_portfolio
  
  # POST /api/portfolios/:portfolio_id/likes
  def create
    @like = @portfolio.likes.build(user: current_user)
    
    if @like.save
      render json: {
        success: true,
        message: 'いいねしました',
        likes_count: @portfolio.likes_count,
        liked: true
      }, status: :created
    else
      render json: {
        success: false,
        message: @like.errors.full_messages.join(', '),
        likes_count: @portfolio.likes_count,
        liked: @portfolio.liked_by?(current_user)
      }, status: :unprocessable_entity
    end
  end
  
  # DELETE /api/portfolios/:portfolio_id/likes
  def destroy
    @like = @portfolio.likes.find_by(user: current_user)
    
    if @like&.destroy
      render json: {
        success: true,
        message: 'いいねを取り消しました',
        likes_count: @portfolio.likes_count,
        liked: false
      }, status: :ok
    else
      render json: {
        success: false,
        message: 'いいねが見つかりません',
        likes_count: @portfolio.likes_count,
        liked: @portfolio.liked_by?(current_user)
      }, status: :not_found
    end
  end
  
  # GET /api/portfolios/:portfolio_id/likes/status
  def status
    render json: {
      likes_count: @portfolio.likes_count,
      liked: @portfolio.liked_by?(current_user)
    }, status: :ok
  end
  
  private
  
  def set_portfolio
    @portfolio = Portfolio.find(params[:portfolio_id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      message: 'ポートフォリオが見つかりません'
    }, status: :not_found
  end
  
  def authenticate_user!
    unless current_user
      render json: {
        success: false,
        message: 'ログインが必要です'
      }, status: :unauthorized
    end
  end
end