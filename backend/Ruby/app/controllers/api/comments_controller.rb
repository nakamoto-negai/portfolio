class Api::CommentsController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :authenticate_user, except: [:index]
  before_action :set_portfolio
  before_action :set_comment, only: [:update, :destroy]

  # GET /api/portfolios/:portfolio_id/comments
  def index
    @comments = @portfolio.comments.includes(:user).order(created_at: :desc)
    render json: @comments.map { |comment|
      {
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        user: {
          id: comment.user.id,
          name: comment.user.name
        }
      }
    }
  end

  # POST /api/portfolios/:portfolio_id/comments
  def create
    @comment = @portfolio.comments.build(comment_params)
    @comment.user = current_user

    if @comment.save
      render json: {
        id: @comment.id,
        content: @comment.content,
        created_at: @comment.created_at,
        updated_at: @comment.updated_at,
        user: {
          id: @comment.user.id,
          name: @comment.user.name
        }
      }, status: :created
    else
      render json: { errors: @comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PUT /api/portfolios/:portfolio_id/comments/:id
  def update
    if @comment.update(comment_params)
      render json: {
        id: @comment.id,
        content: @comment.content,
        created_at: @comment.created_at,
        updated_at: @comment.updated_at,
        user: {
          id: @comment.user.id,
          name: @comment.user.name
        }
      }
    else
      render json: { errors: @comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/portfolios/:portfolio_id/comments/:id
  def destroy
    @comment.destroy
    head :no_content
  end

  private

  def authenticate_user
    unless current_user
      render json: { error: 'ログインが必要です' }, status: :unauthorized
    end
  end

  def set_portfolio
    @portfolio = Portfolio.find(params[:portfolio_id])
  end

  def set_comment
    @comment = @portfolio.comments.find(params[:id])
    unless @comment.user == current_user
      render json: { error: 'Unauthorized' }, status: :forbidden
    end
  end

  def comment_params
    params.require(:comment).permit(:content)
  end
end