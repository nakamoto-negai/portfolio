class Api::V1::UsersController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :set_user, only: [:show, :update]

  # GET /api/v1/users/:id
  def show
    render json: @user.slice(:id, :name, :email, :profile, :skill, :experience, :github_url, :twitter_url)
  end

  # PATCH/PUT /api/v1/users/:id
  def update
    # ログインしているユーザー本人のみ更新可能にする (簡易的な認可)
    if @user.id == session[:user_id] && @user.update(user_params)
      render json: @user.slice(:id, :name, :email, :profile, :skill, :experience, :github_url, :twitter_url)
    else
      render json: { error: '更新できませんでした' }, status: :unprocessable_entity
    end
  end

  private

  def set_user
    @user = User.find(params[:id])
  end

  def user_params
    params.require(:user).permit(:name, :email, :profile, :skill, :experience, :github_url, :twitter_url)
  end
end
